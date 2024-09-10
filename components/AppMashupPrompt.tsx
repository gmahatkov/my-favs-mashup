'use client';

import {Button, Textarea} from "@nextui-org/react";
import {createApiFetch} from "@/utils/createApiFetch";
import React, {useCallback, useEffect, useRef, useState, useMemo } from "react";
import {useTrackList, useTrackListDispatch} from "@/providers/TrackListProvider";
import {IGeneratedTrackInfo} from "@/types/track";
import usePolling from "@/utils/usePolling";
import IconPlay from "@/components/icons/IconPlay";
import {useAudioPlayerDispatch} from "@/providers/AudioPlayerProvider";

export default function AppMashupPrompt () {
    const trackState = useTrackList();
    const { setTrack, setIsPlay } = useAudioPlayerDispatch();
    const trackListDispatch = useTrackListDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const [info, setInfo] = useState<IGeneratedTrackInfo[]>([]);

    const [api] = createApiFetch(document.location.origin);

    const isPollingPersisted = useRef<boolean>(false);

    const infoIds = useMemo(() => info?.map((track) => track.id).join(','), [info]);
    const allComplete = useMemo(() =>
        !!info?.length
        && info?.every((track) =>
            track.status === 'complete' ||
            track.status === 'error' ||
            track.status === 'streaming'
        ), [info]);

    const pollTrackResults = useCallback(async () => {
        if (!infoIds) return;
        const res = await api<{ data: IGeneratedTrackInfo[] }, { ids: string }>({
            path: "/api/tracks/generate",
            method: "GET",
            query: { ids: infoIds },
        });
        return res.data;
    }, [infoIds]);

    const setAudioContext = useCallback((track: IGeneratedTrackInfo) => {
        setTrack(track);
        setIsPlay(true);
    }, [infoIds])

    const clear = useCallback(() => {
        setPrompt("");
        setInfo([]);
        trackListDispatch({ type: "clearSelected", payload: undefined });
    }, [infoIds]);

    const [isPolling, startPolling, stopPolling] = usePolling({
        onSuccess: setInfo,
        onError: console.error,
        apiFetcher: pollTrackResults,
    });

    useEffect(() => {
        isPollingPersisted.current = isPolling;
    }, [isPolling]);

    useEffect(() => {
        if (!infoIds) return;
        if (isPollingPersisted.current && allComplete) return stopPolling();
    }, [infoIds, allComplete]);

    async function loadTrackFeatures (): Promise<void>
    {
        const data = await api<{ prompt: string }>({
            path: "/api/tracks",
            method: "POST",
            body: Array.from(trackState.selected.values())
                .map((track) => ({
                    id: track.id,
                    artistId: track.artistId,
                })),
        });
        setPrompt(data.prompt);
    }

    async function generateMashup (): Promise<void>
    {
        const res = await api<{ data: IGeneratedTrackInfo[] }>({
            path: "/api/tracks/generate",
            method: "POST",
            body: { prompt },
        });
        setInfo(res.data);
        startPolling();
    }

    return (
        <>
            <Textarea
                placeholder={'Mashup prompt'}
                disabled={loading || !prompt}
                className={'mb-4'}
                value={prompt}
            />
            <Button
                onClick={loadTrackFeatures}
                className={'mr-4'}
                disabled={loading || trackState.selected.size < 2}
            >
                Get Prompt for selected tracks.
            </Button>
            {
                prompt && (
                    <>
                        <Button onClick={generateMashup} className={'mr-4'}>
                            Get Mashup
                        </Button>
                        <Button onClick={clear} variant={'light'} color={'danger'}>
                            Clear
                        </Button>
                    </>
                )
            }
            {
                info && (
                    <div>
                        {
                            (info ?? []).map((track, idx) => (
                                <div key={track.id} className={'flex items-center py-4 border-b-1 border-b-gray-800'}>
                                    <Button isIconOnly onClick={() => setAudioContext(track)}>
                                        <IconPlay color={'#FFFFFF'} size={50} />
                                    </Button>
                                    <h3 className={'ml-4'}>{track.title} (Variant #{idx+1})</h3>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </>
    )
}
'use client';

import {Button, Textarea} from "@nextui-org/react";
import {useApi} from "@/utils/useApi";
import {useEffect, useState} from "react";
import {useTrackList} from "@/providers/TrackListProvider";
import {GeneratedTrackInfo} from "@/types/track";
import usePolling from "@/utils/usePolling";

export default function AppMashupPrompt () {
    const trackState = useTrackList();
    const [loading, setLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const [info, setInfo] = useState<GeneratedTrackInfo[]>([]);
    const [api] = useApi(document.location.origin);

    const [isPolling, startPolling, stopPolling] = usePolling({
        onSuccess(res) {
            setInfo(res.data);
        },
        onError(error) {
            console.error(error);
        },
        apiFetcher: async () => {
            return await api<{ data: GeneratedTrackInfo[] }, { ids: string }>({
                path: "/api/tracks/generate",
                method: "GET",
                query: {
                    ids: info?.map((track) => track.id).join(',') ?? '',
                },
            });
        },
    });

    useEffect(() => {
        const allComplete = info?.every((track) => track.status === 'complete' || track.status === 'error' || track.status === 'streaming');
        if (allComplete) stopPolling();
        if (info && info.length && !isPolling) startPolling();
        return () => stopPolling();
    }, [info, isPolling]);

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
        const res = await api<{ data: GeneratedTrackInfo[] }>({
            path: "/api/tracks/generate",
            method: "POST",
            body: { prompt },
        });
        setInfo(res.data);
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
                disabled={loading || trackState.selected.size < 2}
            >
                Get Prompt for selected tracks.
            </Button>
            {
                prompt && (
                    <Button onClick={generateMashup}>
                        Get Mashup
                    </Button>
                )
            }
            {
                info && (
                    <div>
                        {
                            (info ?? []).map((track) => (
                                <div key={track.id}>
                                    <h3>{track.title}</h3>
                                    <audio src={track.audio_url} controls/>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </>
    )
}
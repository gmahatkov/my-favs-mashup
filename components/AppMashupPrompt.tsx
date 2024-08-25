'use client';

import {Button, Textarea} from "@nextui-org/react";
import {useApi} from "@/utils/useApi";
import {useState} from "react";
import {useTrackList} from "@/providers/TrackListProvider";

export default function AppMashupPrompt () {
    const trackState = useTrackList();
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [api] = useApi(document.location.origin);

    async function loadTrackFeatures () {
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
        </>
    )
}
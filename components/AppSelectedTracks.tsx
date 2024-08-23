'use client';

import {useSelectedTracks} from "@/providers/SelectedTracksProvider";
import {useTrackList} from "@/providers/TrackListProvider";
import {useEffect, useState} from "react";
import {Track} from "@/types/track";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";

export default function AppSelectedTracks ()
{
    const selectedTracks = useSelectedTracks();
    const trackState = useTrackList();

    const [selectedTracksInfo, setSelectedTracksInfo] = useState<Map<string, Track>>(new Map());
    const list = Array.from(selectedTracksInfo.values());

    useEffect(() => {
        if (trackState.list.length > 0) {
            setSelectedTracksInfo((cur) => {
                if (!selectedTracks?.size) return new Map();
                const newSelectedTracksInfo = new Map(cur);
                trackState.list.forEach((track) => {
                    if (selectedTracks.has(track.id)) {
                        newSelectedTracksInfo.set(track.id, track);
                    } else {
                        newSelectedTracksInfo.delete(track.id);
                    }
                });
                return newSelectedTracksInfo;
            });
        }
    }, [selectedTracks]);

    return (
        selectedTracks.size === 0
            ? <p>Select more then 1 track to create a mashup.</p>
            : <Table>
                <TableHeader>
                    <TableColumn>Track</TableColumn>
                    <TableColumn>Artist</TableColumn>
                    <TableColumn>Album</TableColumn>
                    <TableColumn>Duration</TableColumn>
                </TableHeader>
                <TableBody>
                    {list.map((track) => (
                        <TableRow key={track.id}>
                            <TableCell>{track.name}</TableCell>
                            <TableCell>{track.artist}</TableCell>
                            <TableCell>{track.album}</TableCell>
                            <TableCell>{track.duration}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
    )
}
'use client';

import {useTrackList} from "@/providers/TrackListProvider";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import {formatDuration} from "@/utils/formatters";

export default function AppSelectedTracks ()
{
    const trackState = useTrackList();

    const list = Array.from(trackState.selected.values());

    return (
        trackState.selected.size === 0
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
                            <TableCell>{formatDuration(track.duration)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
    )
}
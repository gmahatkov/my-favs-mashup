'use client';

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner} from "@nextui-org/react";
import {useSelectedTracks, useSelectedTracksDispatch} from "@/providers/SelectedTracksProvider";
import {useTrackList, useTrackListDispatch} from "@/providers/TrackListProvider";
import {formatDuration} from "@/utils/formatters";

export default function AppTrackList () {
    const selectedTracks = useSelectedTracks();
    const selectedTracksDispatch = useSelectedTracksDispatch();
    const trackState = useTrackList();
    const tracksDispatch = useTrackListDispatch();

    return (
        <>
            <Table
                selectedKeys={selectedTracks}
                selectionMode={'multiple'}
                // @ts-ignore
                onSelectionChange={selectedTracksDispatch}
                bottomContent={
                    trackState.total > 0 && (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                color={'secondary'}
                                total={Math.ceil(trackState.total / trackState.limit)}
                                page={trackState.page}
                                onChange={(page) => tracksDispatch({ type: "setPage", payload: page })}
                            />
                        </div>
                    )
                }
            >
                <TableHeader>
                    <TableColumn>Track</TableColumn>
                    <TableColumn>Artist</TableColumn>
                    <TableColumn>Album</TableColumn>
                    <TableColumn>Duration</TableColumn>
                </TableHeader>
                <TableBody
                    loadingState={trackState.loading ? "loading" : "idle"}
                    loadingContent={<Spinner />}
                >
                    {trackState.list.map((track) => (
                        <TableRow key={track.id}>
                            <TableCell>{track.name}</TableCell>
                            <TableCell>{track.artist}</TableCell>
                            <TableCell>{track.album}</TableCell>
                            <TableCell>{formatDuration(track.duration)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
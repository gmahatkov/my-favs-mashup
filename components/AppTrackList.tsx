'use client';

import {Track} from "@/types/track";
import {useEffect, useState} from "react";
import {useApi} from "@/utils/useApi";
import {GetTrackListQuery, GetTrackListReturnType} from "@/utils/spotify-api";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner} from "@nextui-org/react";

export default function AppTrackList () {
    const [trackList, setTrackList] = useState<Track[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [api] = useApi(document.location.origin);

    useEffect(() => {
        loadTracks();
    }, [page]);

    async function loadTracks() {
        try {
            if (isLoading) return;
            setIsLoading(true);
            const data = await api<GetTrackListReturnType, GetTrackListQuery>({
                path: "/api/tracks",
                query: {
                    page,
                    limit,
                },
            });
            setTrackList(data.list);
            setTotal(data.total);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Table
                selectedKeys={selected}
                selectionMode={'multiple'}
                // @ts-ignore
                onSelectionChange={setSelected}
                bottomContent={
                    total > 0 && (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                color={'secondary'}
                                total={Math.ceil(total / limit)}
                                page={page}
                                onChange={setPage}
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
                    loadingState={isLoading ? "loading" : "idle"}
                    loadingContent={<Spinner />}
                >
                    {trackList.map((track) => (
                        <TableRow key={track.id}>
                            <TableCell>{track.name}</TableCell>
                            <TableCell>{track.artist}</TableCell>
                            <TableCell>{track.album}</TableCell>
                            <TableCell>{track.duration}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
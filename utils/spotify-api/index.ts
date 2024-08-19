"use server";

import {NextRequest} from "next/server";
import {Track} from "@/types/track";
import {getSpotifyToken} from "@/utils/jwt";
import {useApi} from "@/utils/useApi";
import {SPOTIFY_API_BASE} from "@/constants";

export type GetTrackListReturnType = {
    list: Track[];
    total: number;
};

export type GetTrackListQuery = {
    page: number;
    limit: number;
};

export type ListQuery = {
    limit: string;
    offset: string;
}

const useSpotifyHeaders = async (req: NextRequest) => {
    const { accessToken } = await getSpotifyToken(req);
    return {
        Authorization: `Bearer ${accessToken}`,
    };
}

const spotifySavedTrackObjectToTrack = (obj: SpotifyApi.SavedTrackObject): Track => ({
    id: obj.track.id,
    name: obj.track.name,
    artist: obj.track.artists?.[0]?.name ?? "",
    album: obj.track.album.name,
    duration: obj.track.duration_ms,
    image: obj.track.album.images[0].url,
});

export async function useGetTrackList(req: NextRequest): Promise<GetTrackListReturnType> {
    const headers = await useSpotifyHeaders(req);
    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const query: ListQuery = {
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
    };
    const [api] = useApi(SPOTIFY_API_BASE);
    const res = await api<SpotifyApi.UsersSavedTracksResponse, ListQuery>({
        path: '/me/tracks',
        query,
        headers,
    });
    const list = res.items.map(spotifySavedTrackObjectToTrack);
    return {
        list,
        total: res.total,
    };
}
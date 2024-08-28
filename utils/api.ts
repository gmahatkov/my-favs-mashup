"use server";

import {NextRequest} from "next/server";
import {GeneratedTrackInfo, Track, TrackFeatures, TrackIds} from "@/types/track";
import {getSpotifyToken} from "@/utils/jwt";
import {ApiFetch, useApi} from "@/utils/useApi";
import {AIML_API_BASE, SPOTIFY_API_BASE} from "@/constants";

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
    artistId: obj.track.artists?.[0]?.id ?? "",
});

const spotifyAudioFeaturesObjectToTrackFeatures = (obj: SpotifyApi.AudioFeaturesObject): TrackFeatures => ({
    acousticness: obj.acousticness,
    danceability: obj.danceability,
    energy: obj.energy,
    instrumentalness: obj.instrumentalness,
    liveness: obj.liveness,
    loudness: obj.loudness,
    speechiness: obj.speechiness,
    tempo: obj.tempo,
    valence: obj.valence,
    mode: obj.mode,
    key: obj.key,
});

const processFeature = (features: TrackFeatures[]): TrackFeatures => {
    const total = features.length;
    const keys = features
        .map(f => f.key)
        .sort();
    const key = keys[Math.floor(keys.length / 2)];
    return features.reduce((acc, f) => ({
        acousticness: acc.acousticness + f.acousticness / total,
        danceability: acc.danceability + f.danceability / total,
        energy: acc.energy + f.energy / total,
        instrumentalness: acc.instrumentalness + f.instrumentalness / total,
        liveness: acc.liveness + f.liveness / total,
        loudness: acc.loudness + f.loudness / total,
        speechiness: acc.speechiness + f.speechiness / total,
        tempo: acc.tempo + f.tempo / total,
        valence: acc.valence + f.valence / total,
        mode: acc.mode + f.mode / total,
        key: acc.key,
    }), {
        acousticness: 0,
        danceability: 0,
        energy: 0,
        instrumentalness: 0,
        liveness: 0,
        loudness: 0,
        speechiness: 0,
        tempo: 0,
        valence: 0,
        mode: 0,
        key,
    });
}

const featureToPrompt = (feature: TrackFeatures): string => {
    let prompt = "";
    if (feature.energy > 0.5) {
        prompt += "Fast, loud";
    } else {
        prompt += "Slow, quiet";
    }
    if (feature.acousticness > 0.5) prompt += ", acoustic";
    if (feature.danceability > 0.5) prompt += ", rhythmic and danceable";
    if (feature.instrumentalness > 0.8) prompt += ", instrumental, no lyrics";
    if (feature.liveness > 0.8) prompt += ", live sounding"; // 0.8 is a threshold
    if (feature.speechiness > 0.5) prompt += ", has vocals";
    if (feature.valence > 0.5) {
        prompt += ", happy, cheerful, euphoric";
    } else {
        prompt += ", sad, depressed, angry";
    }
    if (feature.mode > 0.5) prompt += ", in major mode, ";
    else prompt += ", in minor mode, ";
    if (feature.tempo > 120) prompt += " fast tempo, ";
    else prompt += " slow tempo, ";
    return prompt;
}

export async function useGetTrackList(req: NextRequest): Promise<GetTrackListReturnType>
{
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

export async function getTrackFeatures(ids: TrackIds[], headers: Record<string, string>, api: ApiFetch): Promise<TrackFeatures[]>
{
    const res = await api<SpotifyApi.MultipleAudioFeaturesResponse>({
        path: '/audio-features',
        query: { ids: ids.map(i => i.id).join(",") },
        headers,
    });
    return res.audio_features.map(spotifyAudioFeaturesObjectToTrackFeatures);
}

export async function getArtistGenre(ids: TrackIds[], headers: Record<string, string>, api: ApiFetch): Promise<string[]>
{
    const artistIds = Array.from(new Set(ids.map(i => i.artistId)));
    const res = await api<SpotifyApi.MultipleArtistsResponse>({
        path: '/artists',
        query: { ids: artistIds.join(",") },
        headers,
    });
    return res.artists
        .map(artist => artist.genres)
        .flat()
        .reduce((acc, genre) => acc.includes(genre) ? acc : [...acc, genre], [] as string[])
        .reduce((acc, cur, _, arr) => {
            const words = cur.split(" ");
            if (words.length > 2) {
                acc.push(cur);
                return acc;
            }
            const similar = arr // Similar genres with 2 words in common with current genre
                .map((i) => i.split(" "))
                .filter((i) => i
                    .filter(j => words.includes(j)).length > 1)
                .map((i) => i.join(" "));
            if (similar.length > 0) {
                const longest = [...similar, cur].reduce((a, b) => a.length > b.length ? a : b);
                if (acc.includes(longest)) return acc;
                acc.push(longest);
                return acc;
            }
            acc.push(cur);
            return acc;
        }, [] as string[])
        .reduce((acc, genre) => acc.includes(genre) ? acc : [...acc, genre], [] as string[]);
}

export async function useGetMashupPrompt(req: NextRequest): Promise<string>
{
    const headers = await useSpotifyHeaders(req);
    const ids = (await req.json()) as TrackIds[];
    if (ids.length < 2) throw new Error("At least 2 tracks are required");
    const [api] = useApi(SPOTIFY_API_BASE);
    const features = await getTrackFeatures(ids, headers, api);
    const genres = await getArtistGenre(ids, headers, api);
    const feature = processFeature(features);
    const featurePrompt = featureToPrompt(feature);
    return `${featurePrompt}${genres.join(", ")}.`;
}

export async function useGenerateTrack(req: NextRequest): Promise<any>
{
    const headers = {
        'Authorization': `Bearer ${process.env.AUTH_AIML_API_KEY as string}`,
        'Content-Type': 'application/json'
    }
    const body = await req.json() as { prompt: string };
    const payload = {
        prompt: body.prompt,
        make_instrumental: false,
        wait_audio: false,
    }
    const [api] = useApi(AIML_API_BASE as string);
    return await api<any>({
        path: '/v1/generate',
        method: 'POST',
        headers,
        body: payload,
    });
}

export async function useGetGeneratedTrackInfo(req: NextRequest): Promise<GeneratedTrackInfo[]>
{
    const headers = {
        'Authorization': `Bearer ${process.env.AUTH_AIML_API_KEY as string}`,
        'Content-Type': 'application/json'
    }
    const ids = req.nextUrl.searchParams.get('ids') as string;
    const [api] = useApi(AIML_API_BASE as string);
    return await api<GeneratedTrackInfo[]>({
        path: '/',
        method: 'GET',
        headers,
        query: ids
            .split(',')
            .reduce((acc, cur, idx) => ({ ...acc, [`ids[${idx}]`]: cur }), {}),
    });
}
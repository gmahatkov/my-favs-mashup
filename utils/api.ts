"use server";

import {NextRequest} from "next/server";
import {IGeneratedTrackInfo, ITrack, ITrackFeatures, ITrackIds} from "@/types/track";
import {getSpotifyToken} from "@/utils/jwt";
import {ApiFetch, createApiFetch} from "@/utils/createApiFetch";
import {AIML_API_BASE, SPOTIFY_API_BASE} from "@/constants";
import {sleep} from "@/utils/misc";

export type GetTrackListReturnType = {
    list: ITrack[];
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

const spotifySavedTrackObjectToTrack = (obj: SpotifyApi.SavedTrackObject): ITrack => ({
    id: obj.track.id,
    name: obj.track.name,
    artist: obj.track.artists?.[0]?.name ?? "",
    album: obj.track.album.name,
    duration: obj.track.duration_ms,
    image: obj.track.album.images[0].url,
    artistId: obj.track.artists?.[0]?.id ?? "",
});

const spotifyAudioFeaturesObjectToTrackFeatures = (obj: SpotifyApi.AudioFeaturesObject): ITrackFeatures => ({
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

const processFeature = (features: ITrackFeatures[]): ITrackFeatures => {
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

const featureToPrompt = (feature: ITrackFeatures): string => {
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
    const [api] = createApiFetch(SPOTIFY_API_BASE);
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

export async function getTrackFeatures(ids: ITrackIds[], headers: Record<string, string>, api: ApiFetch): Promise<ITrackFeatures[]>
{
    const res = await api<SpotifyApi.MultipleAudioFeaturesResponse>({
        path: '/audio-features',
        query: { ids: ids.map(i => i.id).join(",") },
        headers,
    });
    return res.audio_features.map(spotifyAudioFeaturesObjectToTrackFeatures);
}

export async function getArtistGenre(ids: ITrackIds[], headers: Record<string, string>, api: ApiFetch): Promise<string[]>
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
    const ids = (await req.json()) as ITrackIds[];
    if (ids.length < 2) throw new Error("At least 2 tracks are required");
    const [api] = createApiFetch(SPOTIFY_API_BASE);
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
    const [api] = createApiFetch(AIML_API_BASE as string);
    return await api<any>({
        path: '/v1/generate',
        method: 'POST',
        headers,
        body: payload,
    });
    // await sleep(2000);
    // return [
    //     {
    //         "id": "d1ccde39-0876-4b2a-ba6e-c1cefc39a9db",
    //         "title": "",
    //         "lyric": "",
    //         "audio_url": "",
    //         "video_url": "",
    //         "created_at": "2024-09-09T21:49:57.956Z",
    //         "model_name": "chirp-v3",
    //         "status": "submitted",
    //         "gpt_description_prompt": "Fast, loud, rhythmic and danceable, happy, cheerful, euphoric, in major mode,  fast tempo, classic russian rock, russian alternative rock, russian folk rock, russian punk, russian indie.",
    //         "prompt": "",
    //         "type": "gen",
    //         "image_url": ""
    //     },
    //     {
    //         "id": "eb7e588e-b89f-45cc-9381-db20123349fe",
    //         "title": "",
    //         "lyric": "",
    //         "audio_url": "",
    //         "video_url": "",
    //         "created_at": "2024-09-09T21:49:57.956Z",
    //         "model_name": "chirp-v3",
    //         "status": "submitted",
    //         "gpt_description_prompt": "Fast, loud, rhythmic and danceable, happy, cheerful, euphoric, in major mode,  fast tempo, classic russian rock, russian alternative rock, russian folk rock, russian punk, russian indie.",
    //         "prompt": "",
    //         "type": "gen",
    //         "image_url": ""
    //     }
    // ];
}

export async function useGetGeneratedTrackInfo(req: NextRequest): Promise<IGeneratedTrackInfo[]>
{
    const headers = {
        'Authorization': `Bearer ${process.env.AUTH_AIML_API_KEY as string}`,
        'Content-Type': 'application/json'
    }
    const ids = req.nextUrl.searchParams.get('ids') as string;
    const [api] = createApiFetch(AIML_API_BASE as string);
    return await api<IGeneratedTrackInfo[]>({
        path: '/',
        method: 'GET',
        headers,
        query: ids
            .split(',')
            .reduce((acc, cur, idx) => ({ ...acc, [`ids[${idx}]`]: cur }), {}),
    });
    // await sleep(2000);
    // return [
    //     {
    //         "id": "7b15df6f-f84c-4924-aa4f-9b731a67740a",
    //         "title": "Echoes of the Abyss",
    //         "image_url": "",
    //         "lyric": "[Verse]\nBroken mirrors shattered dreams\nEmpty shadows silent screams\nEchos whisper through the void\nLife's illusion paranoid\n[Verse 2]\nStarlit skies a twisted maze\nWalking through this endless haze\nFaces blur in constant fight\nChasing ghosts in dead of night\n[Chorus]\nShout to the heavens no one hears\nDrowning in our darkest fears\nLost in time a fleeting spark\nSinking deeper through the dark\n[Verse 3]\nLightning cracks across the sky\nMillions suffer always why\nRunning circles no escape\nTangled thoughts like ticker tape\n[Bridge]\nWhere's the path that leads to dawn\nIn this night where hope is gone\nSearching blindly through the pain\nPrayers for peace but all in vain\n[Verse 4]\nRivers flow with poisoned lies\nTruth obscured by false disguise\nSilent cries for something more\nBroken hearts forever tore",
    //         "audio_url": "",
    //         "video_url": "",
    //         "created_at": "2024-08-28T13:42:05.573Z",
    //         "model_name": "chirp-v3",
    //         "status": "submitted",
    //         "gpt_description_prompt": "Fast, loud, sad, depressed, angry, in minor mode,  fast tempo, album rock, art rock, classic rock, progressive rock, psychedelic rock, rock, symphonic rock, georgian alternative.",
    //         "prompt": "[Verse]\nBroken mirrors shattered dreams\nEmpty shadows silent screams\nEchos whisper through the void\nLife's illusion paranoid\n\n[Verse 2]\nStarlit skies a twisted maze\nWalking through this endless haze\nFaces blur in constant fight\nChasing ghosts in dead of night\n\n[Chorus]\nShout to the heavens no one hears\nDrowning in our darkest fears\nLost in time a fleeting spark\nSinking deeper through the dark\n\n[Verse 3]\nLightning cracks across the sky\nMillions suffer always why\nRunning circles no escape\nTangled thoughts like ticker tape\n\n[Bridge]\nWhere's the path that leads to dawn\nIn this night where hope is gone\nSearching blindly through the pain\nPrayers for peace but all in vain\n\n[Verse 4]\nRivers flow with poisoned lies\nTruth obscured by false disguise\nSilent cries for something more\nBroken hearts forever tore",
    //         "type": "gen",
    //         "tags": "loud minor mode fast progressive rock",
    //         "duration": undefined,
    //         "error_message": undefined
    //     },
    //     {
    //         "id": "3d974d39-5fe1-4e86-b3aa-090cff50273b",
    //         "title": "",
    //         "image_url": "",
    //         "lyric": "",
    //         "audio_url": "",
    //         "video_url": "",
    //         "created_at": "2024-08-28T13:42:05.573Z",
    //         "model_name": "chirp-v3",
    //         "status": "submitted",
    //         "gpt_description_prompt": "Fast, loud, sad, depressed, angry, in minor mode,  fast tempo, album rock, art rock, classic rock, progressive rock, psychedelic rock, rock, symphonic rock, georgian alternative.",
    //         "prompt": "",
    //         "type": "gen",
    //         "tags": undefined,
    //         "duration": undefined,
    //         "error_message": undefined
    //     }
    // ]
}
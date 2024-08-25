export interface TrackFeatures {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    liveness: number;
    loudness: number;
    speechiness: number;
    tempo: number;
    valence: number;
    mode: number;
    key: number;
}

export interface Track {
    id: string;
    name: string;
    album: string;
    artist: string;
    artistId: string;
    duration: number;
    image: string;
}

export interface TrackIds {
    id: string;
    artistId: string;
}
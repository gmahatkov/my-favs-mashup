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
}

export interface Track {
    id: string;
    name: string;
    album: string;
    artist: string;
    duration: number;
    image: string;
}
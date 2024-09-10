'use client';

import React, {createContext, useContext, useEffect, useState} from "react";
import {IGeneratedTrackInfo} from "@/types/track";

type State = {
    track: IGeneratedTrackInfo | undefined | null;
    isPlay: boolean;
}

type Dispatch = {
    setTrack: (track: IGeneratedTrackInfo | undefined | null) => void;
    setIsPlay: (isPlay: boolean) => void;
}

const AudioPlayerContext = createContext<State | undefined>(undefined);
const AudioPlayerDispatchContext = createContext<Dispatch | undefined>(undefined);

export function useAudioPlayer() {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayer must be used within a AudioPlayerProvider');
    }
    return context;
}

export function useAudioPlayerDispatch() {
    const context = useContext(AudioPlayerDispatchContext);
    if (context === undefined) {
        throw new Error('useAudioPlayerDispatch must be used within a AudioPlayerProvider')
    }
    return context;
}

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [track, setTrack] = useState<IGeneratedTrackInfo | undefined | null>(undefined);
    const [isPlay, setIsPlay] = useState<boolean>(false);

    return (
        <AudioPlayerContext.Provider value={{ track, isPlay }}>
            <AudioPlayerDispatchContext.Provider value={{ setTrack, setIsPlay }}>
                {children}
            </AudioPlayerDispatchContext.Provider>
        </AudioPlayerContext.Provider>
    );
}

export default AudioPlayerProvider;
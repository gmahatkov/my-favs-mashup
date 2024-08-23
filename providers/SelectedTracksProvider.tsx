'use client';

import {createContext, useContext, useState} from "react";

export type SelectedTracksState = Set<string>;

const SelectedTracksContext = createContext<SelectedTracksState | null>(null);
const SelectedTracksDispatchContext = createContext<React.Dispatch<React.SetStateAction<SelectedTracksState>> | null>(null);

export function useSelectedTracks() {
    const context = useContext(SelectedTracksContext);
    if (!context) {
        throw new Error("useSelectedTracks must be used within a SelectedTracksProvider");
    }
    return context;
}

export function useSelectedTracksDispatch() {
    const context = useContext(SelectedTracksDispatchContext);
    if (!context) {
        throw new Error("useSelectedTracksDispatch must be used within a SelectedTracksProvider");
    }
    return context;
}


export const SelectedTracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
    const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

    return (
        <SelectedTracksContext.Provider value={selectedTracks}>
            <SelectedTracksDispatchContext.Provider value={setSelectedTracks}>
                {children}
            </SelectedTracksDispatchContext.Provider>
        </SelectedTracksContext.Provider>
    );
}

export default SelectedTracksProvider;
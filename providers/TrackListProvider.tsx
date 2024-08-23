'use client';

import {createContext, useContext, useEffect, useReducer, useState} from "react";
import {useApi} from "@/utils/useApi";
import {GetTrackListQuery, GetTrackListReturnType} from "@/utils/spotify-api";
import {Track} from "@/types/track";

export type TrackListState = {
    list: Track[];
    total: number;
    limit: number;
    page: number;
    loading: boolean;
}

type TrackListActionType = "setList" | "setTotal" | "setLimit" | "setPage" | "setLoading";

export type TrackListAction<T extends TrackListActionType> = {
    type: T;
    payload: T extends "setList"
        ? Track[]
        : T extends ("setTotal" | "setLimit" | "setPage")
            ? number
            : T extends "setLoading"
                ? boolean
                : never;
}

function trackListReducer(
    state: TrackListState,
    action: TrackListAction<"setList" | "setTotal" | "setLimit" | "setPage" | "setLoading">
): TrackListState
{
    switch (action.type) {
        case "setList":
            return {
                ...state,
                list: action.payload as Track[],
            };
        case "setTotal":
            return {
                ...state,
                total: action.payload as number,
            };
        case "setLimit":
            return {
                ...state,
                limit: action.payload as number,
            };
        case "setPage":
            return {
                ...state,
                page: action.payload as number,
            };
        case "setLoading":
            return {
                ...state,
                loading: action.payload as boolean,
            };
    }
}

const TrackListContext = createContext<TrackListState | null>(null);
const TrackListDispatchContext = createContext<React.Dispatch<TrackListAction<TrackListActionType>> | null>(null);

export function useTrackList() {
    const context = useContext(TrackListContext);
    if (!context) {
        throw new Error("useTrackList must be used within a TrackListProvider");
    }
    return context;
}

export function useTrackListDispatch() {
    const context = useContext(TrackListDispatchContext);
    if (!context) {
        throw new Error("useTrackListDispatch must be used within a TrackListProvider");
    }
    return context;
}

const defaultState: TrackListState = {
    list: [],
    total: 0,
    limit: 20,
    page: 1,
    loading: false,
};

const initializer = (initialState: TrackListState) => initialState;

export const TrackListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
    const [state, dispatch] = useReducer<
        typeof trackListReducer,
        TrackListState
    >(trackListReducer, defaultState, initializer);
    const [api] = useApi(document.location.origin);

    useEffect(() => {
        loadTracks();
    }, [state.page]);

    async function loadTracks() {
        try {
            if (state.loading) return;
            dispatch({ type: "setLoading", payload: true });
            const data = await api<GetTrackListReturnType, GetTrackListQuery>({
                path: "/api/tracks",
                query: {
                    page: state.page,
                    limit: state.limit,
                },
            });
            dispatch({ type: "setList", payload: data.list });
            dispatch({ type: "setTotal", payload: data.total });
        } catch (error) {
            console.error(error);
        } finally {
            dispatch({ type: "setLoading", payload: false });
        }
    }

    return (
        <TrackListContext.Provider value={state}>
            <TrackListDispatchContext.Provider value={dispatch}>
                {children}
            </TrackListDispatchContext.Provider>
        </TrackListContext.Provider>
    );
}

export default TrackListProvider;
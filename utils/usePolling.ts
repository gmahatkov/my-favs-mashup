import { useEffect, useRef, useState, useCallback } from 'react';
import {_noop} from "@/utils/misc";

export type PollingConfig = {
    interval?: number;
    onSuccess: (data: any) => void;
    onError: (error: Error) => void;
    apiFetcher: () => Promise<any>;
    retries?: number;
};
export type UsePollingReturnType = [boolean, () => void, () => void];

export default function usePolling (config: PollingConfig): UsePollingReturnType
{
    const {
        interval = 2000,
        onSuccess = _noop,
        onError = _noop,
        apiFetcher = _noop,
        retries = 3,
    } = config;

    if (onSuccess === _noop || onError === _noop || apiFetcher === _noop)
        throw new Error('Missing required config values');

    const [isPolling, setIsPolling] = useState<boolean>(false);

    const isMounted = useRef<boolean>(true);
    const poll = useRef<ReturnType<typeof setTimeout>>();
    const attempts = useRef<number>(retries);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            stopPolling();
        };
    }, []);

    useEffect(() => {
        if (isPolling) runPolling();
    }, [isPolling]);

    const startPolling = () =>
    {
        if (!isPolling) setIsPolling(true);
    }

    const stopPolling = () =>
    {
        if (isPolling && isMounted.current)
        {
            setIsPolling(false);
            clearTimeout(poll.current);
            poll.current = undefined;
        }
    }

    const runPolling = () =>
    {
        poll.current = setTimeout(async () =>
        {
            try
            {
                const data = await apiFetcher();
                onSuccess(data);
                if (isMounted.current && isPolling) runPolling();
            }
            catch (error)
            {
                onError(error as Error);
                if (isMounted.current && isPolling && attempts.current > 0)
                {
                    attempts.current--;
                    runPolling();
                }
            }
        }, interval);
    }

    return [isPolling, startPolling, stopPolling];
}
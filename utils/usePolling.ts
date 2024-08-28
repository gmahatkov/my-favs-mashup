import { useEffect, useRef, useState } from 'react';
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

    const [polling, setPolling] = useState<boolean>(false);

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

    const startPolling = () =>
    {
        if (!polling)
        {
            setPolling(true);
            runPolling();
        }
    }

    const stopPolling = () =>
    {
        if (polling && isMounted.current)
        {
            setPolling(false);
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
                if (isMounted.current && polling) runPolling();
            }
            catch (error)
            {
                onError(error as Error);
                if (isMounted.current && polling && attempts.current > 0)
                {
                    attempts.current--;
                    runPolling();
                }
            }
        }, interval);
    }

    return [polling, startPolling, stopPolling];
}
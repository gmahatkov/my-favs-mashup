type ApiFetchParams<P extends Record<string, string | number | boolean> = {}> = {
    path: string;
    query?: P;
    body?: object;
    headers?: Record<string, string>;
    method?: string;
}

type ApiFetchReturnType<T> = T;

export type ApiFetch = <T extends object, P extends Record<string, string | number | boolean> = {}>(params: ApiFetchParams<P>) => Promise<ApiFetchReturnType<T>>;

export function useApi(basePath: string = ''): [ApiFetch, AbortController] {
    const controller = new AbortController();
    const signal = controller.signal;
    const api: ApiFetch = async function<
        T extends object,
        P extends Record<string, string | number | boolean> = {}
    >(params: ApiFetchParams<P>)
    {
        const url = new URL(basePath);
        url.pathname = (url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`) + (params.path.startsWith('/') ? params.path.slice(1) : params.path);
        if (params.query) {
            Object.entries(params.query).forEach(([key, value]) => {
                url.searchParams.append(key, value.toString());
            });
        }
        const res = await fetch(url, {
            method: params.method ?? "GET",
            headers: {
                "Content-Type": "application/json",
                ...params.headers,
            },
            body: params.body ? JSON.stringify(params.body) : undefined,
            signal,
        });
        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        return await res.json() as T;
    };
    return [api, controller];
}
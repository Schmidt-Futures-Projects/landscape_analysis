import { useState, useCallback, useMemo } from 'react';

const API_BASE_URL: string = 'http://localhost:8000';

export type HttpResult<T, E> = {
    loading: boolean;
    data: T | null;
    error: E | null;
    callRequest: () => void;
};

async function parseResponse(resp: Response): Promise<any> {
    const text = await resp.text();
    return JSON.parse(text);
}


export async function handleRestResponse(resp: Response): Promise<any> {
    if (resp.status >= 200 && resp.status < 300) {
        return parseResponse(resp);
    } else if (resp.status === 422) {
        const data = await parseResponse(resp);
        return await Promise.reject({
            status: resp.status,
            statusText: resp.statusText,
            ...data
        });
    } else {
        const data = await parseResponse(resp);
        const errorStatusText = resp.statusText || 'Unexpected error';
        return await Promise.reject(`${errorStatusText}: ${data.message || data.detail || 'Unknown error'}`);
    }
}

export async function request<TResponse>(
    url: string,
    config: RequestInit = {}
): Promise<TResponse> {
    try {
        const resp = await fetch(url, config);
        const data = await handleRestResponse(resp);
        return data as TResponse;
    } catch (error) {
        throw new Error(error as string);
    }
}

export const useHttp = <T, E = any>(
    url: string,
    config: RequestInit = {},
): HttpResult<T, E> => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<E | null>(null);
    const [data, setData] = useState<T | null>(null);

    const stableConfig = useMemo(() => config, [JSON.stringify(config)]);

    const callRequest = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await request<T>(API_BASE_URL + url, config);
            setData(result);
        } catch (err) {
            setError(err as E);
        } finally {
            setLoading(false);
        }
    }, [url, stableConfig]);

    return { loading, data, error, callRequest };
};
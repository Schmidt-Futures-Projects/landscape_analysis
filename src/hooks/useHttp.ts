import { useState, useCallback, useMemo } from 'react';

const API_BASE_URL: string = 'http://localhost:8000';

export type HttpResult<T, E> = {
    loading: boolean;
    data: T | null;
    error: E | null;
    callRequest: () => void;
};

function parseResponse(resp: Response): Promise<any> {
    return resp.text().then(JSON.parse);
}

export function handleRestResponse(resp: Response): Promise<any> {
    if (resp.status >= 200 && resp.status < 300) {
        return parseResponse(resp);
    } else if (resp.status === 422) {
        return parseResponse(resp).then((data: any) => Promise.reject({ 
            status: resp.status,
            statusText: resp.statusText,
            ...data 
        }));
    } else {
        return parseResponse(resp)
            .then((data: any) => {
                const errorStatusText = resp.statusText || 'Unexpected error';
                return Promise.reject(`${errorStatusText}: ${data.message || data.detail || 'Unknown error'}`);
            });
    }
}

export function request<TResponse>(
    url: string,
    config: RequestInit = {}
): Promise<TResponse> {
    return fetch(url, config)
        .then(handleRestResponse)
        .then((data) => data as TResponse)
        .catch((error: string) => {
            throw new Error(error);
        });
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
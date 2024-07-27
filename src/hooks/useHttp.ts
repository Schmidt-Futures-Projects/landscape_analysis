import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL: string = 'localhost:8000';

export type HttpResult<T, E = any> = {
    loading: boolean;
    data: T | null;
    error: E | null;
};

function parseResponse(resp: Response): Promise<any> {
    return resp.text().then(JSON.parse);
}

export function handleRestResponse(resp: Response): Promise<any> {
    if (resp.status >= 200 && resp.status < 300) {
        // OK Response
        return parseResponse(resp);
    } else if (resp.status === 422) {
        // Validation failed
        return parseResponse(resp).then((data: any) => Promise.reject(data));
    }
    // Other error
    const error: any = new Error(resp.statusText);
    error.response = resp;
    throw error;
}

export function request<TResponse>(
    url: string,
    config: RequestInit = {}
): Promise<TResponse> {
    return fetch(url, config)
        .then(handleRestResponse)
        .then((data) => data as TResponse);
}

export const useHttp = <T, E = any>(
    url: string,
    config: RequestInit = {}
): HttpResult<T, E> => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<E | null>(null);
    const [data, setData] = useState<T | null>(null);

    const fetchData = useCallback(async () => {
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
    }, [url, config]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { loading, data, error };
};
import { useState, useCallback, useEffect, useMemo } from 'react';

const API_BASE_URL: string = 'http://localhost:8000';

export type HttpResult<T> = {
    data: T | null;
    error: Error | null;
    loading: boolean;
};

export type UseHttpResult<T> = HttpResult<T> & {
    callRequest: () => Promise<void>;
};

async function parseResponse(resp: Response): Promise<any> {
    const text = await resp.text();
    return JSON.parse(text);
}

export function useHttp<T>(url: string, options: RequestInit = {}): UseHttpResult<T> {
    const [result, setResult] = useState<HttpResult<T>>({
        data: null,
        error: null,
        loading: false,
    });

    const stableOptions = useMemo(() => options, [JSON.stringify(options)]);

    const callRequest = useCallback(async () => {
        setResult(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch(API_BASE_URL + url, options);
            if (!response.ok) {
                const data = await parseResponse(response);
                const errorStatusText = response.statusText || 'Unexpected error';
                throw new Error(`${errorStatusText}: ${data.message || data.detail || 'Unknown error'}`);
            }
            const data = await response.json();
            setResult({ data, error: null, loading: false });
        } catch (error) {
            setResult({ data: null, error: error as Error, loading: false });
        }
    }, [url, stableOptions]);

    return { ...result, callRequest };
}
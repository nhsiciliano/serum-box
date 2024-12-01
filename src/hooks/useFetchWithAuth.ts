import { useCallback } from 'react';
import { useActiveUser } from './useActiveUser';

export const useFetchWithAuth = () => {
    const { getRequestHeaders } = useActiveUser();

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        const defaultHeaders = getRequestHeaders();
        const finalHeaders = {
            ...defaultHeaders,
            ...(options.headers || {})
        };

        console.log('Sending headers:', finalHeaders);

        const response = await fetch(url, {
            ...options,
            headers: finalHeaders
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }, [getRequestHeaders]);

    return { fetchWithAuth };
};

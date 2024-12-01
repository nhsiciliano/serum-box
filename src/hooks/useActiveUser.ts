import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export const useActiveUser = () => {
    const { data: session } = useSession();
    const [activeUserId, setActiveUserId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('currentUserId') || session?.user?.id || '';
        }
        return '';
    });

    const getRequestHeaders = useCallback(() => {
        const currentUserId = localStorage.getItem('currentUserId') || session?.user?.id || '';
        return {
            'Content-Type': 'application/json',
            'x-active-user-id': currentUserId
        };
    }, [session?.user?.id]);

    const setActiveUserIdSafe = useCallback((userId: string) => {
        setActiveUserId(userId);
        localStorage.setItem('currentUserId', userId);
    }, []);

    return {
        activeUserId,
        setActiveUserId: setActiveUserIdSafe,
        getRequestHeaders
    };
};
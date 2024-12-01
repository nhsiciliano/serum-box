"use client"

import { useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import CreateGradillaForm from '@/components/CreateGradillaForm';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

export default function CreateGrillaPage() {
    const router = useRouter();
    const { canCreateGrid } = usePlanRestrictions();
    const { fetchWithAuth } = useFetchWithAuth();

    useEffect(() => {
        const checkRestrictions = async () => {
            try {
                const data = await fetchWithAuth('/api/user-stats');
                if (!canCreateGrid(data.gridCount)) {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error checking restrictions:', error);
            }
        };

        checkRestrictions();
    }, [canCreateGrid, router, fetchWithAuth]);

    return (
        <Box>
            <Heading as="h2" color="gray.500" size="xl" mb={6}>Create New Grid</Heading>
            <CreateGradillaForm />
        </Box>
    );
}

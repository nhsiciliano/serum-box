"use client"

import { useEffect } from 'react';
import { Box, Heading, VStack } from '@chakra-ui/react';
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
        <Box p={{ base: 4, md: 8 }} display="flex" justifyContent="center">
            <VStack spacing={8} align="stretch" width="100%" maxWidth="800px">
                <Heading as="h1" size="xl" color="brand.700">
                    Create a New Grid
                </Heading>
                <CreateGradillaForm />
            </VStack>
        </Box>
    );
}

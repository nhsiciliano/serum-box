"use client"

import { useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import CreateGradillaForm from '@/components/CreateGradillaForm';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';

export default function CreateGrillaPage() {
    const router = useRouter();
    const { canCreateGrid } = usePlanRestrictions();

    useEffect(() => {
        const checkRestrictions = async () => {
            const response = await fetch('/api/user-stats');
            if (response.ok) {
                const data = await response.json();
                if (!canCreateGrid(data.gridCount)) {
                    router.push('/dashboard');
                }
            }
        };

        checkRestrictions();
    }, []);

    return (
        <Box>
            <Heading as="h2" color="gray.500" size="xl" mb={6}>Crear Nueva Gradilla</Heading>
            <CreateGradillaForm />
        </Box>
    );
}

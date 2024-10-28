'use client'

import { Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { getRemainingDays } from '@/lib/dateUtils';

export function TrialExpirationAlert({ planStartDate }: { planStartDate: Date }) {
    const router = useRouter();
    const remainingDays = getRemainingDays(new Date(planStartDate));

    if (remainingDays > 5) return null;

    return (
        <Alert status="warning">
            <AlertIcon />
            <Box flex="1">
                Tu período de prueba termina en {remainingDays} días.
            </Box>
            <Button 
                size="sm" 
                colorScheme="blue"
                onClick={() => router.push('/dashboard/admin-cuenta')}
            >
                Actualizar Plan
            </Button>
        </Alert>
    );
}


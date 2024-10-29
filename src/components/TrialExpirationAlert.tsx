'use client'

import { Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { getRemainingDays, isTrialExpired } from '@/lib/dateUtils';

export function TrialExpirationAlert({ planStartDate }: { planStartDate: Date }) {
    const router = useRouter();
    const remainingDays = getRemainingDays(new Date(planStartDate));
    const trialExpired = isTrialExpired(new Date(planStartDate));

    if (remainingDays > 5 && !trialExpired) return null;

    return (
        <Alert status={trialExpired ? "info" : "warning"}>
            <AlertIcon />
            <Box flex="1" color={trialExpired ? "black" : "gray.700"}>
                {trialExpired 
                    ? "Tu período de prueba ha finalizado. Puedes continuar utilizando el plan gratuito."
                    : `Tu período de prueba termina en ${remainingDays} días.`
                }
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


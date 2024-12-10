'use client'

import { Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

interface TrialExpirationAlertProps {
    planStartDate: Date;
    currentPlan?: string;
}

export function TrialExpirationAlert({ currentPlan = 'free' }: TrialExpirationAlertProps) {
    const router = useRouter();

    // No mostrar ninguna alerta para el plan gratuito
    if (currentPlan === 'free') {
        return (
            <Alert status="info">
            <AlertIcon />
            <Box flex="1" color="black">
                {`You are currently on the ${currentPlan} plan. To get more features, please upgrade your plan.`}
            </Box>
            <Button 
                size="sm" 
                colorScheme="blue"
                onClick={() => router.push('/dashboard/admin-cuenta')}
            >
                Manage Plan
            </Button>
        </Alert>
        );
    }

    // Solo mostrar alertas para planes pagados
    if (currentPlan === 'standard' || currentPlan === 'premium') {
        return (
            <Alert status="info">
                <AlertIcon />
                <Box flex="1" color="black">
                    {`You are currently on the ${currentPlan} plan.`}
                </Box>
                <Button 
                    size="sm" 
                    colorScheme="blue"
                    onClick={() => router.push('/dashboard/admin-cuenta')}
                >
                    Manage Plan
                </Button>
            </Alert>
        );
    }

    return null;
}


'use client'

import { Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { getRemainingDays, isTrialExpired } from '@/lib/dateUtils';

interface TrialExpirationAlertProps {
    planStartDate: Date;
    currentPlan?: string;
}

export function TrialExpirationAlert({ planStartDate, currentPlan = 'free' }: TrialExpirationAlertProps) {
    const router = useRouter();
    const remainingDays = getRemainingDays(new Date(planStartDate));
    const trialExpired = isTrialExpired(new Date(planStartDate));

    // No mostrar el alert si el usuario tiene un plan pagado (standard o premium)
    // y ya pasó el período de prueba
    if (
        (currentPlan === 'standard' || currentPlan === 'premium') && 
        trialExpired
    ) {
        return null;
    }

    // No mostrar si quedan más de 5 días y no ha expirado
    if (remainingDays > 5 && !trialExpired) {
        return null;
    }

    return (
        <Alert status={trialExpired ? "info" : "warning"}>
            <AlertIcon />
            <Box flex="1" color={trialExpired ? "black" : "gray.700"}>
                {trialExpired 
                    ? "Your trial period has ended. You can continue using the free plan."
                    : `Your trial period ends in ${remainingDays} days.`
                }
            </Box>
            <Button 
                size="sm" 
                colorScheme="blue"
                onClick={() => router.push('/dashboard/admin-cuenta')}
            >
                Upgrade Plan
            </Button>
        </Alert>
    );
}


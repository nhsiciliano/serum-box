'use client'

import { Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

import { Link } from '@chakra-ui/react';

interface TrialExpirationAlertProps {
    trialEndsAt?: Date | null;
    planType: string;
    paypalSubscriptionId?: string | null;
}

export function TrialExpirationAlert({ trialEndsAt, planType, paypalSubscriptionId }: TrialExpirationAlertProps) {
    const router = useRouter();

    // Si el usuario tiene una suscripción activa, no se muestra ninguna alerta de prueba.
    if (paypalSubscriptionId) {
        return null;
    }

    const now = new Date();

    // Si no hay fecha de finalización de la prueba, significa que el usuario está en un plan gratuito sin prueba.
    if (!trialEndsAt) {
        if (planType === 'free') {
            return (
                <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                        You are on the Free plan.
                        <Link onClick={() => router.push('/dashboard/admin-cuenta')} color="blue.500" fontWeight="bold" ml={2}>
                            Upgrade to unlock more features!
                        </Link>
                    </Box>
                </Alert>
            );
        }
        return null; // No mostrar para otros planes sin suscripción (caso improbable).
    }

    const trialEndDate = new Date(trialEndsAt);
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // La prueba está activa
    if (daysRemaining > 0) {
        const status = daysRemaining <= 5 ? 'warning' : 'info';
        const message = `You have ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left in your trial.`;
        return (
            <Alert status={status} borderRadius="md">
                <AlertIcon />
                <Box flex="1" color="gray.600">
                    <strong>{message}</strong>
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

    // La prueba ha expirado
    if (daysRemaining <= 0) {
        return (
            <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                    Your trial has expired. You are now on the Free plan.
                    <Link onClick={() => router.push('/dashboard/admin-cuenta')} color="blue.500" fontWeight="bold" ml={2}>
                        Upgrade to a paid plan to restore your features.
                    </Link>
                </Box>
            </Alert>
        );
    }

    return null;
}


'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Container, Heading, Text, Spinner } from '@chakra-ui/react';
import { useSession, signOut } from 'next-auth/react';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let countdownInterval: NodeJS.Timeout;
        const subscriptionId = searchParams.get('subscription_id');

        const updatePlan = async () => {
            if (!subscriptionId || isUpdating || !session?.user?.email || isSuccess) return;

            setIsUpdating(true);
            try {
                console.log('Verifying subscription:', subscriptionId);
                
                // Verificar el estado de la suscripción
                const verifyResponse = await fetch(`/api/verify-paypal-subscription?subscription_id=${subscriptionId}`);
                const subscriptionData = await verifyResponse.json();
                
                console.log('Subscription verification response:', subscriptionData);

                if (subscriptionData.status === 'active') {
                    console.log('Updating plan with data:', {
                        planType: subscriptionData.planType,
                        paypalSubscriptionId: subscriptionData.subscriptionId,
                        startTime: subscriptionData.startTime,
                        nextBillingTime: subscriptionData.nextBillingTime
                    });

                    // Actualizar el plan del usuario
                    const updateResponse = await fetch('/api/update-plan-after-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            planType: subscriptionData.planType,
                            paypalSubscriptionId: subscriptionData.subscriptionId,
                            startTime: subscriptionData.startTime,
                            nextBillingTime: subscriptionData.nextBillingTime
                        })
                    });

                    const updateResult = await updateResponse.json();
                    console.log('Plan update result:', updateResult);

                    if (!updateResponse.ok) {
                        throw new Error(updateResult.error || 'Error updating plan');
                    }

                    setIsSuccess(true);
                    
                    // Iniciar cuenta regresiva para cerrar sesión
                    let timeLeft = 5;
                    countdownInterval = setInterval(() => {
                        timeLeft -= 1;
                        setCountdown(timeLeft);
                        
                        if (timeLeft <= 0) {
                            clearInterval(countdownInterval);
                            signOut({ callbackUrl: '/login' });
                        }
                    }, 1000);
                } else {
                    setError('The subscription is not active. Please contact support.');
                }
            } catch (error) {
                console.error('Error processing subscription:', error);
                setError('There was an error processing your subscription. Please contact support.');
            } finally {
                setIsUpdating(false);
            }
        };

        updatePlan();

        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [searchParams, session?.user?.email, isUpdating, isSuccess]);

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <Box 
                    bg="white" 
                    p={8} 
                    borderRadius="lg" 
                    boxShadow="sm" 
                    textAlign="center"
                >
                    <Heading as="h1" mb={6} color="red.500">Error</Heading>
                    <Text fontSize="xl" color="gray.700">{error}</Text>
                </Box>
            </Container>
        );
    }

    if (isUpdating) {
        return (
            <Container maxW="container.xl" py={8}>
                <Box textAlign="center">
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.600" mt={4}>Proccessing your subscription...</Text>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Box 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="sm" 
                textAlign="center"
            >
                <Heading as="h1" mb={6} color="green.500">¡Payment Successful!</Heading>
                <Text fontSize="xl" mb={6} color="gray.700">
                    Thank you for your subscription. Your plan has been updated successfully.
                </Text>
                {isSuccess && (
                    <Text fontSize="lg" color="blue.600" mb={4}>
                        Closing session in {countdown} seconds. Log in again to see the changes.
                    </Text>
                )}
            </Box>
        </Container>
    );
}


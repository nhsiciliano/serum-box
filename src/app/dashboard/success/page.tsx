'use client'

import { useEffect, useState } from 'react';
import { Box, Heading, Text, Container, Spinner, useToast } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import { useSession, signOut } from 'next-auth/react';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { data: session } = useSession();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const toast = useToast();
    const { fetchWithAuth } = useFetchWithAuth();

    useEffect(() => {
        let isMounted = true;
        let countdownInterval: NodeJS.Timeout;

        const updatePlan = async () => {
            if (!sessionId || isUpdating || !session?.user?.email || isSuccess) return;

            setIsUpdating(true);
            try {
                if (!isMounted) return;

                const stripeSession = await fetch(`/api/verify-stripe-session?session_id=${sessionId}`);
                const { planType, subscriptionId, customerId } = await stripeSession.json();

                if (!isMounted) return;

                await fetchWithAuth('/api/update-plan-after-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planType,
                        stripeSubscriptionId: subscriptionId,
                        customerId
                    })
                });

                if (!isMounted) return;

                setIsSuccess(true);
                
                toast({
                    title: "Plan Updated Successfully",
                    description: `Your plan has been upgraded to ${planType}. You will be logged out in 5 seconds to apply changes.`,
                    status: "success",
                    duration: 6000,
                    isClosable: true,
                });

                let timeLeft = 5;
                countdownInterval = setInterval(() => {
                    if (!isMounted) return;
                    
                    timeLeft -= 1;
                    setCountdown(timeLeft);
                    
                    if (timeLeft <= 0) {
                        clearInterval(countdownInterval);
                        signOut({ callbackUrl: '/login' });
                    }
                }, 1000);

            } catch (error) {
                if (!isMounted) return;
                
                console.error('Error updating plan:', error);
                toast({
                    title: "Error",
                    description: "There was an error updating your plan",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                if (isMounted) {
                    setIsUpdating(false);
                }
            }
        };

        if (sessionId && !isSuccess) {
            updatePlan();
        }

        return () => {
            isMounted = false;
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, session?.user?.email]);

    if (isUpdating) {
        return (
            <Container maxW="container.xl" py={8}>
                <Box textAlign="center">
                    <Spinner size="xl" color="blue.500" />
                    <Text color="gray.600" mt={4}>Processing your payment...</Text>
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
                <Heading as="h1" mb={6} color="green.500">Payment Successful!</Heading>
                <Text fontSize="xl" mb={6} color="gray.700">
                    Thank you for your subscription. Your plan has been successfully updated.
                </Text>
                {isSuccess && (
                    <Text fontSize="lg" color="blue.600" mb={4}>
                        Logging out in {countdown} seconds. Log in again to see your changes.
                    </Text>
                )}
            </Box>
        </Container>
    );
}


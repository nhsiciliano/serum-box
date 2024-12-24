/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    VStack,
    Heading,
    Text,
    useColorModeValue,
    Button,
    Alert,
    AlertIcon,
    useToast
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { PlanChangeButton } from '@/components/PlanChangeButton';
import { Plan } from '@/types/plans';

const PLANS: Plan[] = [
    {
        name: 'standard',
        displayName: 'Standard',
        description: 'Up to 1000 samples, 5 customizable racks + Stock Manager',
        prices: {
            1: { price: 10, priceId: 'price_standard_1' },
            12: { price: 100, priceId: 'price_standard_12' }
        }
    },
    {
        name: 'premium',
        displayName: 'Premium',
        description: 'Unlimited grids and tubes + Stock Manager + Stock Analytics',
        prices: {
            1: { price: 18, priceId: 'price_premium_1' },
            12: { price: 196, priceId: 'price_premium_12' }
        }
    }
];

export default function AdminCuenta() {
    const { data: session } = useSession();
    const [selectedPlan, setSelectedPlan] = useState<string>('standard');
    const [selectedDuration, setSelectedDuration] = useState<1 | 12>(1);
    const [currentPlan, setCurrentPlan] = useState<string>('');
    const [planEndDate, setPlanEndDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.600', 'gray.200');

    useEffect(() => {
        const checkPlanStatus = async () => {
            try {
                const response = await fetch('/api/check-payment-status');
                const data = await response.json();
                setCurrentPlan(data.planType || 'free');
                setPlanEndDate(data.subscription?.endDate ? new Date(data.subscription.endDate) : null);
            } catch (error) {
                console.error('Error checking plan status:', error);
            }
        };

        checkPlanStatus();
    }, []);

    const handleCancelSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error canceling subscription');
            }

            toast({
                title: "Subscription Canceled",
                description: "Your subscription will be canceled at the end of the current period",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Actualizar el estado local
            const checkResponse = await fetch('/api/check-payment-status');
            const data = await checkResponse.json();
            setCurrentPlan(data.planType);
            setPlanEndDate(data.subscription?.endDate ? new Date(data.subscription.endDate) : null);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not cancel subscription. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    return (
        <Box 
            minH="100vh" 
            bg={bgColor} 
            py={8}
        >
            <Container maxW="1200px">
                <VStack spacing={8} align="stretch">
                    <Heading 
                        as="h1" 
                        color={textColor} 
                        size="xl" 
                        mb={6}
                    >
                        Manage Account
                    </Heading>

                    {/* Current Plan Section */}
                    <Box 
                        bg={cardBgColor} 
                        p={6} 
                        borderRadius="lg" 
                        boxShadow="sm"
                    >
                        <Heading 
                            as="h2" 
                            color={textColor} 
                            size="lg" 
                            mb={4}
                        >
                            Current Plan
                        </Heading>
                        <Text fontSize="xl" color="green.700" mb={4}>
                            {currentPlan === 'free' ? 'Free Plan' : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan`}
                        </Text>
                        {planEndDate && currentPlan !== 'free' && (
                            <Text fontSize="md" color="gray.500">
                                Valid until: {formatDate(planEndDate)}
                            </Text>
                        )}
                        {currentPlan !== 'free' && (
                            <Button
                                mt={4}
                                colorScheme="red"
                                variant="outline"
                                onClick={handleCancelSubscription}
                                isLoading={isLoading}
                            >
                                Cancel Subscription
                            </Button>
                        )}
                    </Box>

                    {/* Plan Selection Section */}
                    {currentPlan === 'free' && (
                        <Box 
                            bg={cardBgColor} 
                            p={6} 
                            borderRadius="lg" 
                            boxShadow="sm"
                        >
                            <Heading 
                                as="h2" 
                                color={textColor} 
                                size="lg" 
                                mb={6}
                            >
                                Select Plan
                            </Heading>

                            <VStack spacing={4} align="stretch">
                                {PLANS.map((plan) => (
                                    <Box
                                        key={plan.name}
                                        p={4}
                                        borderWidth={1}
                                        borderRadius="md"
                                        borderColor={selectedPlan === plan.name ? 'blue.500' : 'gray.200'}
                                        cursor="pointer"
                                        onClick={() => setSelectedPlan(plan.name)}
                                        _hover={{ borderColor: 'blue.500' }}
                                    >
                                        <Heading size="md" color="green.700" mb={2}>{plan.displayName}</Heading>
                                        <Text color="gray.700" mb={4}>{plan.description}</Text>
                                        <Text color="gray.700" fontWeight="bold">
                                            ${plan.prices?.[selectedDuration]?.price || 0} every {selectedDuration} months
                                        </Text>
                                    </Box>
                                ))}

                                <Box mt={4}>
                                    <Text color="gray.500" mb={2}>Plan duration:</Text>
                                    <Button
                                        mr={2}
                                        colorScheme={selectedDuration === 1 ? 'blue' : 'gray'}
                                        onClick={() => setSelectedDuration(1)}
                                    >
                                        Monthly
                                    </Button>
                                    <Button
                                        colorScheme={selectedDuration === 12 ? 'blue' : 'gray'}
                                        onClick={() => setSelectedDuration(12)}
                                    >
                                        Annual
                                    </Button>
                                </Box>

                                {session?.user?.id && (
                                    <PlanChangeButton
                                        selectedPlan={selectedPlan}
                                        selectedDuration={selectedDuration}
                                        userId={session.user.id}
                                        plans={PLANS}
                                    />
                                )}
                            </VStack>
                        </Box>
                    )}

                    {currentPlan !== 'free' && planEndDate && (
                        <Alert status="info" color="gray.700">
                            <AlertIcon />
                            Your current plan will be active until {formatDate(planEndDate)}. 
                            If you cancel your subscription, you can continue using the plan until this date.
                        </Alert>
                    )}
                </VStack>
            </Container>
        </Box>
    );
}


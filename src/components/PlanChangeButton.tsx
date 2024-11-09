'use client';

import { Button, useToast } from '@chakra-ui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Plan, PLAN_LIMITS } from '@/types/plans';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PlanChangeButtonProps {
    selectedPlan: string;
    selectedDuration: 3 | 6 | 12;
    userId: string;
    plans: Plan[];
}

export function PlanChangeButton({ 
    selectedPlan, 
    selectedDuration, 
    userId,
    plans 
}: PlanChangeButtonProps) {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscription = async (priceId: string, planType: string) => {
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    priceId,
                    planType,
                    duration: selectedDuration,
                    userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la respuesta del servidor');
            }

            const { sessionId } = await response.json();
            const stripe = await stripePromise;
            
            if (!stripe) {
                throw new Error('No se pudo inicializar Stripe');
            }

            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Payment could not be processed. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleConfirmPlanChange = async () => {
        if (!userId) {
            console.error('User not authenticated');
            return;
        }

        try {
            setIsLoading(true);
            const selectedPlanData = plans.find(plan => plan.name === selectedPlan);
            
            if (!selectedPlanData) {
                console.error('Plan not found');
                return;
            }

            if (selectedPlanData.name === 'free') {
                await fetch('/api/update-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        planType: selectedPlanData.name,
                        ...PLAN_LIMITS.free
                    }),
                });
                
                toast({
                    title: "Success",
                    description: "Your plan has been updated to Free",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            if (selectedPlanData.prices) {
                const priceId = selectedPlanData.prices[selectedDuration].priceId;
                await handleSubscription(priceId, selectedPlanData.name);
            }
        } catch (error) {
            console.error('Error changing plan:', error);
            toast({
                title: "Error",
                description: "Could not change plan. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={handleConfirmPlanChange}
            isLoading={isLoading}
            loadingText="Processing..."
            width={{ base: "100%", md: "auto" }}
        >
            Confirm Plan Change
        </Button>
    );
}

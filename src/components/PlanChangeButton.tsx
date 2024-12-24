'use client';

import { Button, useToast } from '@chakra-ui/react';
import { Plan } from '@/types/plans';
import { useState } from 'react';

interface PlanChangeButtonProps {
    selectedPlan: string;
    selectedDuration: 1 | 12;
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

    const handleSubscription = async (planType: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/create-paypal-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    planType,
                    duration: selectedDuration,
                    userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la respuesta del servidor');
            }

            const { approvalUrl } = await response.json();
            window.location.href = approvalUrl;
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudo procesar el pago. Por favor, intente nuevamente.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedPlanData = plans.find(p => p.name === selectedPlan);
    if (!selectedPlanData) return null;

    return (
        <Button
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={isLoading}
            onClick={() => handleSubscription(selectedPlan)}
        >
            PayPal Subscription
        </Button>
    );
}

'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    VStack,
    Heading,
    Text,
    useColorModeValue,
    Button,
    useToast,
    SimpleGrid,
    Flex,
    Icon,
    Switch,
    FormControl,
    FormLabel,
    Badge,
    List,
    ListItem,
    ListIcon,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { PlanChangeButton } from '@/components/PlanChangeButton';
import { Plan } from '@/types/plans';
import { FiCheckCircle, FiPackage, FiCalendar, FiXCircle } from 'react-icons/fi';

const PLANS: Plan[] = [
    {
        name: 'standard',
        displayName: 'Standard',
        description: 'Up to 1000 samples, 5 customizable racks + Stock Manager',
        features: [
            '1,000 samples',
            '5 customizable racks',
            'Stock Manager',
        ],
        prices: {
            1: { price: 10, priceId: 'price_standard_1' },
            12: { price: 100, priceId: 'price_standard_12' },
        },
    },
    {
        name: 'premium',
        displayName: 'Premium',
        description: 'Unlimited grids and tubes + Stock Manager + Stock Analytics',
        features: [
            'Unlimited samples',
            'Unlimited racks',
            'Stock Manager',
            'Stock Analytics',
        ],
        prices: {
            1: { price: 18, priceId: 'price_premium_1' },
            12: { price: 196, priceId: 'price_premium_12' },
        },
    },
];

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

interface CurrentPlanCardProps {
    currentPlan: string;
    planEndDate: Date | null;
    onCancel: () => void;
    isLoading: boolean;
}

const CurrentPlanCard = ({ currentPlan, planEndDate, onCancel, isLoading }: CurrentPlanCardProps) => {
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const headingColor = useColorModeValue('gray.800', 'white');

    const isFree = currentPlan === 'free';
    const isActive = !isFree && planEndDate && new Date(planEndDate) > new Date();

    return (
        <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="md" h="100%">
            <Heading size="md" mb={4} color={headingColor}>Current Subscription</Heading>
            <VStack spacing={4} align="start">
                <Flex align="center">
                    <Icon as={FiPackage} mr={3} w={6} h={6} color="brand.500" />
                    <Box>
                        <Text fontWeight="bold" fontSize="lg" textTransform="capitalize" color={headingColor}> 
                            {currentPlan} Plan
                        </Text>
                        <Badge colorScheme={isActive ? 'green' : 'gray'} >
                            {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </Box>
                </Flex>
                {isActive && planEndDate && (
                    <Flex align="center">
                        <Icon as={FiCalendar} mr={3} w={6} h={6} color="gray.500" />
                        <Box>
                            <Text color={textColor}>Renews on</Text>
                            <Text fontWeight="medium" color={headingColor}>{formatDate(new Date(planEndDate))}</Text>
                        </Box>
                    </Flex>
                )}
                {isActive && (
                    <Button 
                        leftIcon={<FiXCircle />} 
                        colorScheme="red" 
                        variant="outline" 
                        size="sm"
                        onClick={onCancel}
                        isLoading={isLoading}
                    >
                        Cancel Subscription
                    </Button>
                )}
                {isFree && (
                    <Text color={textColor}>You are currently on the Free plan. Choose a plan to upgrade.</Text>
                )}
            </VStack>
        </Box>
    );
};

interface PricingCardProps {
    plan: Plan;
    duration: 1 | 12;
    isSelected: boolean;
    onSelect: (name: string) => void;
}

const PricingCard = ({ plan, duration, isSelected, onSelect }: PricingCardProps) => {
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const headingColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const selectedBorderColor = useColorModeValue('brand.500', 'brand.300');

    const price = plan.prices?.[duration]?.price || 0;

    return (
        <Box 
            p={8} 
            bg={cardBg} 
            borderRadius="xl" 
            borderWidth={2}
            borderColor={isSelected ? selectedBorderColor : borderColor}
            boxShadow={isSelected ? 'lg' : 'md'}
            cursor="pointer"
            onClick={() => onSelect(plan.name)}
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
            h="100%"
        >
            <VStack spacing={4} align="stretch" textAlign="center">
                <Heading size="lg" color={headingColor}>{plan.displayName}</Heading>
                <Text fontSize="4xl" fontWeight="extrabold" color={headingColor}>${price}</Text>
                <Text color={textColor}>per {duration === 1 ? 'month' : 'year'}</Text>
                <List spacing={3} textAlign="left" my={6}>
                    {plan.features?.map((feature, index) => (
                        <ListItem key={index} color={textColor}>
                            <ListIcon as={FiCheckCircle} color="green.500" />
                            {feature}
                        </ListItem>
                    ))}
                </List>
            </VStack>
        </Box>
    );
};

export default function AdminCuenta() {
    const { data: session } = useSession();
    const [selectedPlan, setSelectedPlan] = useState<string>('standard');
    const [duration, setDuration] = useState<1 | 12>(1);
    const [currentPlan, setCurrentPlan] = useState<string>('');
    const [planEndDate, setPlanEndDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const bgColor = useColorModeValue('gray.50', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'gray.200');

    useEffect(() => {
        const checkPlanStatus = async () => {
            try {
                const response = await fetch('/api/paypal/plan-status');
                if (!response.ok) throw new Error('Failed to fetch plan status');
                const data = await response.json();
                setCurrentPlan(data.planType || 'free');
                setPlanEndDate(data.planEndDate ? new Date(data.planEndDate) : null);
            } catch (error) {
                console.error('Error checking plan status:', error);
                toast({ title: 'Error', description: 'Could not fetch plan status.', status: 'error' });
            }
        };
        checkPlanStatus();
    }, [toast]);

    const handleCancelSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/paypal/cancel-subscription', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to cancel subscription');
            toast({ title: 'Success', description: 'Your subscription will be canceled at the end of the current period.', status: 'success' });
            const data = await response.json();
            setCurrentPlan(data.planType || 'free');
            setPlanEndDate(data.subscription?.endDate ? new Date(data.subscription.endDate) : null);
        } catch (error) {
            console.error('Error canceling subscription:', error);
            toast({ title: 'Error', description: 'Could not cancel subscription.', status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box bg={bgColor} py={{ base: 8, md: 12 }}>
            <Container maxW="container.xl">
                <VStack spacing={8} align="stretch">
                    <Heading as="h1" size="xl" color={headingColor} textAlign="center">
                        Account & Subscription
                    </Heading>
                    <Text textAlign="center" fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                        Manage your plan and billing details.
                    </Text>

                    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mt={8}>
                        <Box gridColumn={{ base: 'auto', lg: 'span 1' }}>
                           <CurrentPlanCard 
                                currentPlan={currentPlan}
                                planEndDate={planEndDate}
                                onCancel={handleCancelSubscription}
                                isLoading={isLoading}
                           />
                        </Box>

                        <VStack gridColumn={{ base: 'auto', lg: 'span 2' }} spacing={8} align="stretch">
                            <FormControl display="flex" alignItems="center" justifyContent="center">
                                <FormLabel htmlFor="billing-duration" color="brand.700" fontWeight="bold" mb="0" mr={4}>
                                    Monthly
                                </FormLabel>
                                <Switch 
                                    id="billing-duration" 
                                    isChecked={duration === 12}
                                    onChange={() => setDuration(prev => prev === 1 ? 12 : 1)}
                                    colorScheme="brand"
                                />
                                <FormLabel htmlFor="billing-duration" color="brand.700" fontWeight="bold" mb="0" ml={4}>
                                    Annual (Save 15%)
                                </FormLabel>
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                {PLANS.map((plan) => (
                                    <PricingCard 
                                        key={plan.name}
                                        plan={plan}
                                        duration={duration}
                                        isSelected={selectedPlan === plan.name}
                                        onSelect={setSelectedPlan}
                                    />
                                ))}
                            </SimpleGrid>

                            {session?.user?.id && (
                                <Flex justifyContent="center">
                                    <PlanChangeButton
                                        selectedPlan={selectedPlan}
                                        selectedDuration={duration}
                                        userId={session.user.id}
                                        plans={PLANS}
                                    />
                                </Flex>
                            )}
                        </VStack>
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
}

'use client'

import {
    Box,
    Heading,
    Text,
    VStack,
    Button,
    useColorModeValue,
    SimpleGrid,
    Radio,
    RadioGroup,
    Select,
    Container,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import { getRemainingDays, formatDate, isTrialExpired } from '@/lib/dateUtils';
import { PlanInfo } from '@/components/PlanInfo';
import { TrialExpirationAlert } from '@/components/TrialExpirationAlert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const handleSubscription = async (priceId: string) => {
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId }),
        });

        const { sessionId } = await response.json();
        const stripe = await stripePromise;

        if (stripe) {
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

interface PlanPrices {
    3: { price: number; priceId: string };
    6: { price: number; priceId: string };
    12: { price: number; priceId: string };
}

interface Plan {
    name: string;
    description: string;
    prices?: PlanPrices;
    price?: string;
    priceId?: string;
}

const plans: Plan[] = [
    {
        name: "Gratuito",
        description: "2 gradillas personalizables, máximo 162 tubos en total",
        price: "Gratis",
        priceId: "price_free" // Este ID no se usará realmente para pagos
    },
    {
        name: "Standard",
        description: "5 gradillas personalizables, máximo 1000 tubos en total",
        prices: {
            3: { price: 3.8, priceId: "price_1Q8SYJGpIdSNVSdh4fcsMmRL" },
            6: { price: 3, priceId: "price_1Q8SZGGpIdSNVSdhoyBhQJiG" },
            12: { price: 2.3, priceId: "price_1Q8SZxGpIdSNVSdhTmFjxNZF" }
        }
    },
    {
        name: "Premium",
        description: "Gradillas y tubos ilimitados",
        prices: {
            3: { price: 4.5, priceId: "price_1Q8SamGpIdSNVSdhRkzld6me" },
            6: { price: 3.8, priceId: "price_1Q8SbSGpIdSNVSdhXMmnIUa3" },
            12: { price: 3, priceId: "price_1Q8ScGGpIdSNVSdhEOrr0zdU" }
        }
    },
];

export default function AdminCuenta() {
    const { data: session } = useSession();
    const [selectedPlan, setSelectedPlan] = useState<string>("Gratuito");
    const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(3);
    const [isLoading, setIsLoading] = useState(false);
    const [userGrids, setUserGrids] = useState(0);
    const [userTubes, setUserTubes] = useState(0);
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'gray.100');

    // Usar useEffect para actualizar el plan seleccionado cuando la sesión esté disponible
    useEffect(() => {
        if (session?.user?.planType) {
            setSelectedPlan(session.user.planType);
        }
    }, [session]);

    // Obtener el número de gradillas y tubos del usuario
    useEffect(() => {
        const fetchUserStats = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch('/api/user-stats');
                    if (response.ok) {
                        const data = await response.json();
                        setUserGrids(data.gridCount);
                        setUserTubes(data.tubeCount);
                    }
                } catch (error) {
                    console.error('Error al obtener estadísticas del usuario:', error);
                }
            }
        };

        fetchUserStats();
    }, [session]);

    const handleConfirmPlanChange = async () => {
        if (!session?.user?.id) {
            console.error('Usuario no autenticado');
            return;
        }

        try {
            setIsLoading(true);
            const selectedPlanData = plans.find(plan => plan.name === selectedPlan);
            
            if (!selectedPlanData) {
                console.error('Plan no encontrado');
                return;
            }

            if (selectedPlanData.name === 'Gratuito') {
                // Lógica para cambiar a plan gratuito
                await fetch('/api/update-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: session.user.id,
                        planType: 'free'
                    }),
                });
                return;
            }

            if (selectedPlanData.prices) {
                const priceId = selectedPlanData.prices[selectedDuration].priceId;
                await handleSubscription(priceId);
            }
        } catch (error) {
            console.error('Error al cambiar el plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPrice = (plan: Plan) => {
        if (plan.price) return plan.price;
        if (plan.prices) {
            return `$${plan.prices[selectedDuration].price.toFixed(2)}/mes`;
        }
        return "Precio no disponible";
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
                        Administrar cuenta
                    </Heading>

                    {/* Sección Plan Actual */}
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
                            Plan actual
                        </Heading>
                        
                        <VStack align="start" spacing={4}>
                            <Text 
                                fontSize="xl" 
                                color="green.600" 
                                fontWeight="bold"
                            >
                                {selectedPlan}
                            </Text>
                            
                            {session?.user?.planStartDate && (
                                <>
                                    <Text color={textColor}>
                                        Inicio del plan: {formatDate(new Date(session.user.planStartDate))}
                                    </Text>
                                    
                                    <Box width="100%">
                                        <TrialExpirationAlert 
                                            planStartDate={new Date(session.user.planStartDate)}
                                        />
                                    </Box>
                                    
                                    {!isTrialExpired(new Date(session.user.planStartDate)) && (
                                        <Text color="blue.500" fontWeight="semibold">
                                            Período de prueba Premium: {getRemainingDays(new Date(session.user.planStartDate))} días restantes
                                        </Text>
                                    )}
                                </>
                            )}
                            
                            <Box width="100%">
                                <PlanInfo 
                                    currentGrids={userGrids}
                                    currentTubes={userTubes}
                                />
                            </Box>
                        </VStack>
                    </Box>

                    {/* Sección Cambio de Plan */}
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
                            Duración del plan
                        </Heading>
                        
                        <Select
                            value={selectedDuration}
                            onChange={(e) => setSelectedDuration(Number(e.target.value) as 3 | 6 | 12)}
                            bg={cardBgColor}
                            color={textColor}
                            mb={6}
                        >
                            <option value={3}>3 meses</option>
                            <option value={6}>6 meses</option>
                            <option value={12}>12 meses</option>
                        </Select>

                        <Heading 
                            as="h2" 
                            color={textColor} 
                            size="lg" 
                            mb={4}
                        >
                            Cambiar plan
                        </Heading>

                        <RadioGroup onChange={setSelectedPlan} value={selectedPlan}>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                {plans.map((plan) => (
                                    <Box
                                        key={plan.name}
                                        bg={useColorModeValue('gray.50', 'gray.600')}
                                        p={6}
                                        borderRadius="lg"
                                        boxShadow="md"
                                        cursor="pointer"
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Radio value={plan.name} mb={3}>
                                            <Text fontWeight="bold" color={textColor}>{plan.name}</Text>
                                        </Radio>
                                        <Text color={useColorModeValue('gray.600', 'gray.200')} mb={3}>
                                            {plan.description}
                                        </Text>
                                        <Text fontWeight="bold" color={textColor}>
                                            {getPrice(plan)}
                                        </Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </RadioGroup>

                        <Box mt={8}>
                            <Button 
                                colorScheme="blue" 
                                size="lg" 
                                onClick={handleConfirmPlanChange}
                                isLoading={isLoading}
                                loadingText="Procesando..."
                                width={{ base: "100%", md: "auto" }}
                            >
                                Confirmar cambio de plan
                            </Button>
                        </Box>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
}

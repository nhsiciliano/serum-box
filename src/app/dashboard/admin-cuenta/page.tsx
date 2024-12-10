/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import {
    Box,
    Heading,
    Text,
    VStack,
    useColorModeValue,
    SimpleGrid,
    Radio,
    RadioGroup,
    Select,
    Container,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/dateUtils';
import { PlanInfo } from '@/components/PlanInfo';
import { TrialExpirationAlert } from '@/components/TrialExpirationAlert';
import { Plan, PLAN_LIMITS } from '@/types/plans';
import { PlanChangeButton } from '@/components/PlanChangeButton';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';


const plans: Plan[] = [
    {
        name: 'free',
        description: `${PLAN_LIMITS.free.maxGrids} customizable grids, maximum ${PLAN_LIMITS.free.maxTubes} tubes in total`,
        price: "Free"
    },
    {
        name: 'standard',
        description: `${PLAN_LIMITS.standard.maxGrids} customizable grids, maximum ${PLAN_LIMITS.standard.maxTubes} tubes in total`,
        prices: {
            3: { price: 8, priceId: "price_1QUCLUGpIdSNVSdhpkG1J2DE" },
            6: { price: 6, priceId: "price_1QUCRPGpIdSNVSdhx0jr35fa" },
            12: { price: 4, priceId: "price_1QUCSTGpIdSNVSdhEwE9Uskh" }
        }
    },
    {
        name: 'premium',
        description: "Unlimited grids and tubes",
        prices: {
            3: { price: 16, priceId: "price_1QUCXQGpIdSNVSdhn2DVvpKF" },
            6: { price: 14, priceId: "price_1QUCY5GpIdSNVSdhMUEDrjOL" },
            12: { price: 12, priceId: "price_1QUCYuGpIdSNVSdhTUwJ7M2v" }
        }
    }
];

export default function AdminCuenta() {
    const { data: session } = useSession();
    const [selectedPlan, setSelectedPlan] = useState<string>("Free");
    const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(3);
    const [userGrids, setUserGrids] = useState(0);
    const [userTubes, setUserTubes] = useState(0);
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'gray.100');
    const { fetchWithAuth } = useFetchWithAuth();

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
                    const data = await fetchWithAuth('/api/user-stats');
                    setUserGrids(data.gridCount);
                    setUserTubes(data.tubeCount);
                } catch (error) {
                    console.error('Error al obtener estadísticas del usuario:', error);
                }
            }
        };

        fetchUserStats();
    }, [session, fetchWithAuth]);

    const getPrice = (plan: Plan) => {
        if (plan.price) return plan.price;
        if (plan.prices) {
            return `$${plan.prices[selectedDuration].price.toFixed(2)}/month`;
        }
        return "Price not available";
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
                                        Plan start date: {formatDate(new Date(session.user.planStartDate))}
                                    </Text>
                                    
                                    <Box width="100%">
                                        <TrialExpirationAlert 
                                            planStartDate={new Date(session.user.planStartDate)}
                                            currentPlan={session.user.planType}
                                        />
                                    </Box>
                                    
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

                    {/* Plan Change Section */}
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
                            Plan Duration
                        </Heading>
                        
                        <Select
                            value={selectedDuration}
                            onChange={(e) => setSelectedDuration(Number(e.target.value) as 3 | 6 | 12)}
                            bg={cardBgColor}
                            color={textColor}
                            mb={6}
                        >
                            <option value={3}>3 months</option>
                            <option value={6}>6 months</option>
                            <option value={12}>12 months</option>
                        </Select>

                        <Heading 
                            as="h2" 
                            color={textColor} 
                            size="lg" 
                            mb={4}
                        >
                            Change Plan
                        </Heading>

                        <RadioGroup onChange={setSelectedPlan} value={selectedPlan}>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                {plans.map((plan) => (
                                    <Box
                                        key={plan.name}
                                        // eslint-disable-next-line react-hooks/rules-of-hooks
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
                            {session?.user?.id && (
                                <PlanChangeButton 
                                    selectedPlan={selectedPlan}
                                    selectedDuration={selectedDuration}
                                    userId={session.user.id}
                                    plans={plans}
                                />
                            )}
                        </Box>
                    </Box>

                </VStack>
            </Container>
        </Box>
    );
}


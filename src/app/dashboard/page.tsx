"use client"

import { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Center, useToast, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { PlanInfo } from '@/components/PlanInfo';
import { useSession } from 'next-auth/react';
import { TrialExpirationAlert } from '@/components/TrialExpirationAlert';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import StockManager from '@/components/StockManager';
import StockAnalytics from '@/components/StockAnalytics';

interface Gradilla {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tubes: any[];
}


export default function DashboardHome() {
  const router = useRouter();
  const [grillas, setGrillas] = useState<Gradilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { restrictions, canCreateGrid } = usePlanRestrictions();
  const toast = useToast();
  const { data: session } = useSession();
  const { fetchWithAuth } = useFetchWithAuth();
  const planType = session?.user?.planType || 'free';

  const fetchGrillas = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const data = await fetchWithAuth('/api/gradillas', {
        headers: {
          'x-include-secondary': 'true'
        }
      });
      setGrillas(prevGrillas => {
        const isDifferent = JSON.stringify(prevGrillas) !== JSON.stringify(data);
        return isDifferent ? data : prevGrillas;
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las gradillas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast, session?.user?.id]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    if (session?.user?.id && isMounted) {
      setIsLoading(true);
      timeoutId = setTimeout(fetchGrillas, 100);
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session?.user?.id, fetchGrillas]);

  const handleCreateGrilla = async () => {
    if (!canCreateGrid(grillas.length)) {
      toast({
        title: "Grid limit reached",
        description: `Your current plan allows a maximum of ${restrictions.maxGrids} grids. Consider upgrading your plan to create more.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    router.push('/dashboard/create-grilla');
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Grid Manager Section */}
        <Box>
          <Heading as="h2" color="gray.500" size="xl" mb={6}>
            Grid Manager
          </Heading>
          
          {session?.user?.planStartDate && (
            <Box mb={4}>
              <TrialExpirationAlert 
                planStartDate={new Date(session.user.planStartDate)}
                currentPlan={session.user.planType}
              />
            </Box>
          )}
          
          <Box mb={6} bg="white" borderRadius="lg" boxShadow="sm">
            <PlanInfo 
              currentGrids={grillas.length}
              currentTubes={grillas.reduce((total, grilla) => total + (grilla.tubes?.length || 0), 0)}
            />
          </Box>

          {grillas.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {grillas.map((grilla) => (
                <Link href={`/dashboard/gradilla/${grilla.id}`} key={grilla.id} passHref>
                  <Box 
                    as="button"
                    bg="green.700"
                    color="white"
                    borderRadius="lg" 
                    p={4} 
                    height="150px"
                    width="100%"
                    _hover={{ 
                      bg: "green.600",
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    _active={{
                      bg: "green.800",
                      transform: 'scale(0.95)',
                    }}
                  >
                    <Center height="100%">
                      <Text fontSize="xl" fontWeight="bold">{grilla.name}</Text>
                    </Center>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" mt={10} py={10}>
              <Text fontSize="xl" color="gray.500" mb={8}>Start creating your custom grids</Text>
              <Button colorScheme="teal" onClick={handleCreateGrilla}>
                Create Grid
              </Button>
            </Box>
          )}
          {grillas.length > 0 && (
            <Button mt={6} colorScheme="teal" onClick={handleCreateGrilla}>
              Create New Grid
            </Button>
          )}
        </Box>

        {/* Stock Manager Section */}
        <Box width="100%">
          <Heading as="h2" color="gray.500" size="xl" mb={6}>
            Stock Manager
          </Heading>
          <StockManager />
        </Box>

        {/* Stock Analytics Section - Solo mostrar si el usuario tiene plan Premium */}
        {planType === 'premium' && (
          <Box width="100%">
            <Heading as="h2" color="gray.500" size="xl" mb={6}>
              Stock Analytics
            </Heading>
            <StockAnalytics />
          </Box>
        )}
      </VStack>
    </Box>
  );
}

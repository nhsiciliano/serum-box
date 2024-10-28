"use client"

import { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, SimpleGrid, Center, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { PlanInfo } from '@/components/PlanInfo';
import { useSession } from 'next-auth/react';
import { TrialExpirationAlert } from '@/components/TrialExpirationAlert';

interface Gradilla {
  id: string;
  name: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [grillas, setGrillas] = useState<Gradilla[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { restrictions, canCreateGrid } = usePlanRestrictions();
  const toast = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    fetchGrillas();
  }, []);

  const fetchGrillas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gradillas');
      if (!response.ok) throw new Error('Error al obtener las gradillas');
      const data: Gradilla[] = await response.json();
      setGrillas(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGrilla = async () => {
    if (!canCreateGrid(grillas.length)) {
      toast({
        title: "Límite de gradillas alcanzado",
        description: `Tu plan actual permite un máximo de ${restrictions.maxGrids} gradillas. Considera actualizar tu plan para crear más.`,
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
      <Heading as="h2" color="gray.500" size="xl" mb={6}>Administrador de Gradillas</Heading>
      
      {/* Agregar TrialExpirationAlert */}
      {session?.user?.planStartDate && (
        <Box mb={4}>
          <TrialExpirationAlert 
            planStartDate={new Date(session.user.planStartDate)} 
          />
        </Box>
      )}
      
      {/* PlanInfo existente */}
      <Box mb={6} bg="white" borderRadius="lg" boxShadow="sm">
        <PlanInfo 
          currentGrids={grillas.length}
          currentTubes={grillas.reduce((total, grilla) => total + (grilla.tubeCount || 0), 0)}
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
          <Text fontSize="xl" color="gray.500" mb={8}>Comienza a crear tus gradillas personalizadas</Text>
          <Button colorScheme="teal" onClick={handleCreateGrilla}>
            Crear Gradilla
          </Button>
        </Box>
      )}
      {grillas.length > 0 && (
        <Button mt={6} colorScheme="teal" onClick={handleCreateGrilla}>
          Crear Nueva Gradilla
        </Button>
      )}
    </Box>
  );
}

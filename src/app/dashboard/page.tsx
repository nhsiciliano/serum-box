"use client"

import { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Text,
  VStack,
  useColorModeValue,
  useToast, 
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PlanInfo } from '@/components/PlanInfo';
import { useSession } from 'next-auth/react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import StockManager from '@/components/StockManager';
import StockAnalytics from '@/components/StockAnalytics';
import { EmailSupport } from '@/components/EmailSupport';
import DashboardOverview from '@/components/DashboardOverview';
import GridManager from '@/components/GridManager';
import { DashboardSection } from '@/components/ResponsiveContainers';

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
  const toast = useToast();
  const { data: session } = useSession();
  const { fetchWithAuth } = useFetchWithAuth();
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const bodyColor = useColorModeValue('gray.500', 'gray.400');

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
    router.push('/dashboard/create-grilla');
  };
  
  const handleDeleteGrid = async (gridId: string) => {
    if (!gridId) return;
    
    try {
      await fetchWithAuth(`/api/gradillas/${gridId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-active-user-id': localStorage.getItem('currentUserId') || ''
        }
      });
      
      // Asumimos que la eliminación fue exitosa si la llamada a la API no arrojó un error.
      // Actualizamos el estado local para reflejar el cambio en la UI.
      setGrillas(prev => prev.filter(g => g.id !== gridId));
      
      toast({
        title: 'Gradilla eliminada',
        description: 'La gradilla se eliminó correctamente.',
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting grid:', error);
      toast({
        title: "Error",
        description: 'No se pudo eliminar la gradilla. Intentá nuevamente.',
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
      <VStack align="stretch" spacing={1} mb={6}>
        <Text fontSize={{ base: '2xl', md: '3xl' }} color={headingColor} fontWeight="semibold" lineHeight="1.1">
          Operación diaria
        </Text>
        <Text color={bodyColor}>
          Seguimiento de inventario, gestión de capacidad y control de acciones del laboratorio desde un solo espacio.
        </Text>
      </VStack>

      <Box mb={8}>
        <DashboardOverview />
      </Box>

      <Box mb={8}>
        <PlanInfo 
          currentGrids={grillas.length}
          currentTubes={grillas.reduce((total, grilla) => total + (grilla.tubes?.length || 0), 0)}
        />
      </Box>

      {/* Grid Manager Section */}
      <DashboardSection title="Gestión de gradillas" fullWidth>
        <GridManager 
          grids={grillas} 
          onCreateGrid={handleCreateGrilla}
          onDeleteGrid={handleDeleteGrid}
        />
      </DashboardSection>

      {/* Stock Manager Section */}
      <DashboardSection title="Gestión de stock" fullWidth>
        <StockManager />
      </DashboardSection>

      <DashboardSection title="Analítica de stock" fullWidth>
        <StockAnalytics />
      </DashboardSection>
      <DashboardSection title="Soporte por correo" fullWidth>
        <EmailSupport />
      </DashboardSection>
    </Box>
  );
}

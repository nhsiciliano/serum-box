"use client"

import { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  useToast, 
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { PlanInfo } from '@/components/PlanInfo';
import { useSession } from 'next-auth/react';
import { TrialExpirationAlert } from '@/components/TrialExpirationAlert';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import StockManager from '@/components/StockManager';
import StockAnalytics from '@/components/StockAnalytics';
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
        title: "Grid Deleted",
        description: "The grid has been successfully removed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting grid:', error);
      toast({
        title: "Error",
        description: "Could not delete grid. Please try again.",
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
      {/* Alert for trial users */}
      {session?.user && (
        <Box mb={6}>
          <TrialExpirationAlert 
            trialEndsAt={session.user.trialEndsAt ? new Date(session.user.trialEndsAt) : null}
            planType={session.user.planType || 'free'}
            paypalSubscriptionId={session.user.paypalSubscriptionId}
          />
        </Box>
      )}

      {/* Dashboard Overview Section */}
      <Box mb={8}>
        <DashboardOverview />
      </Box>
      
      {/* Plan Info Card */}
      <Box mb={8} bg="white" borderRadius="lg" boxShadow="md" p={4}>
        <PlanInfo 
          currentGrids={grillas.length}
          currentTubes={grillas.reduce((total, grilla) => total + (grilla.tubes?.length || 0), 0)}
        />
      </Box>

      {/* Grid Manager Section */}
      <DashboardSection title="Grid Manager" fullWidth>
        <GridManager 
          grids={grillas} 
          canCreateGrid={canCreateGrid(grillas.length)}
          onCreateGrid={handleCreateGrilla}
          onDeleteGrid={handleDeleteGrid}
        />
      </DashboardSection>

      {/* Stock Manager Section */}
      <DashboardSection title="Stock Manager" fullWidth>
        <StockManager />
      </DashboardSection>

      {/* Analytics Section (Premium only) */}
      {planType === 'premium' && (
        <DashboardSection title="Stock Analytics" fullWidth>
          <StockAnalytics />
        </DashboardSection>
      )}
    </Box>
  );
}

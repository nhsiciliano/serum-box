import {
  Alert,
  AlertIcon,
  Box,
  Center,
  Flex,
  HStack,
  Heading,
  Icon,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { FiActivity, FiCalendar, FiChevronRight, FiDatabase, FiShield } from 'react-icons/fi';
import { MdOutlineScience } from 'react-icons/md';
import { DashboardSection, GridContainer } from './ResponsiveContainers';

interface DashboardData {
  totalGrids: number;
  totalTubes: number;
  lowInventory: number;
  expiringSoon: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function StatCard({ title, value, icon }: StatCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box
      p={5}
      bg={bg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 8px 22px rgba(15, 23, 42, 0.04)"
    >
      <Flex justify="space-between" align="flex-start" gap={4}>
        <Stat>
          <StatLabel color={labelColor} fontWeight="medium">{title}</StatLabel>
          <StatNumber color={valueColor} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="semibold">
            {value.toLocaleString()}
          </StatNumber>
        </Stat>
        <Center
          w={11}
          h={11}
          borderRadius="lg"
          bg="teal.50"
          color="teal.600"
          border="1px solid"
          borderColor="teal.100"
        >
          <Icon as={icon} boxSize={5} />
        </Center>
      </Flex>
    </Box>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

function QuickAction({ title, description, icon, href }: QuickActionProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const titleColor = useColorModeValue('gray.800', 'gray.100');
  const bodyColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      as={NextLink}
      href={href}
      p={4}
      bg={bg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      transition="all 0.18s ease"
      _hover={{
        borderColor: 'teal.200',
        transform: 'translateY(-2px)',
      }}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Center w={10} h={10} borderRadius="lg" bg="teal.50" color="teal.600">
            <Icon as={icon} boxSize={5} />
          </Center>
          <Icon as={FiChevronRight} color={bodyColor} />
        </HStack>
        <Box>
          <Text color={titleColor} fontWeight="semibold">{title}</Text>
          <Text color={bodyColor} fontSize="sm">{description}</Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/dashboard-overview');
        if (!response.ok) {
          throw new Error('No se pudieron obtener los datos del panel');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado');
        }
        setDashboardData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardSection title="Resumen del panel" subtitle="Estado en tiempo real de gradillas, tubos y riesgo de inventario." fullWidth>
      {isLoading && (
        <Center p={10}>
          <Spinner size="xl" color="teal.500" />
        </Center>
      )}

      {error && (
        <Alert status="error" borderRadius="lg" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {dashboardData && (
        <GridContainer columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 4, md: 5 }} mb={8}>
          <StatCard title="Total de gradillas" value={dashboardData.totalGrids} icon={FiDatabase} />
          <StatCard title="Total de tubos" value={dashboardData.totalTubes} icon={MdOutlineScience} />
          <StatCard title="Stock bajo" value={dashboardData.lowInventory} icon={FiActivity} />
          <StatCard title="Próximos a vencer" value={dashboardData.expiringSoon} icon={FiCalendar} />
        </GridContainer>
      )}

      <Box>
        <Heading size="sm" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>Acciones rápidas</Heading>
        <GridContainer columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 4, md: 5 }}>
          <QuickAction
            title="Crear gradilla"
            description="Configurá un nuevo mapa de almacenamiento"
            icon={FiDatabase}
            href="/dashboard/create-grilla"
          />
          <QuickAction
            title="Gestionar stock"
            description="Actualizá lotes y cantidades"
            icon={MdOutlineScience}
            href="/dashboard/inventory"
          />
          <QuickAction
            title="Registro de auditoría"
            description="Revisá la actividad operativa"
            icon={FiShield}
            href="/dashboard/audit-log"
          />
          <QuickAction
            title="Cuenta"
            description="Controlá usuarios y configuración"
            icon={FiActivity}
            href="/dashboard/admin-cuenta"
          />
        </GridContainer>
      </Box>
    </DashboardSection>
  );
}

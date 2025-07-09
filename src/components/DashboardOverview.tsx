import { 
  Box, 
  Stat,
  StatLabel, 
  StatNumber, 
  Flex,
  Icon,
  Text,
  Heading,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
  Alert,
  AlertIcon,
  Center,
} from '@chakra-ui/react';
import { DashboardSection, GridContainer } from './ResponsiveContainers';
import { FiDatabase, FiUsers, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { MdOutlineScience } from 'react-icons/md';
import { useState, useEffect } from 'react';

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
  iconBg: string;
  isCompact?: boolean;
  p?: number | { base: number; md: number };
}

function StatCard({ title, value, icon, iconBg, isCompact = false, p = 4 }: StatCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('white', 'gray.100');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      p={p}
      bg={bgColor}
      shadow="sm"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      _hover={{ shadow: 'md' }}
    >
      <Flex justifyContent="space-between" align="center">
        <Box>
          <Stat>
            <StatLabel fontWeight="medium" color={labelColor} isTruncated>{title}</StatLabel>
            <StatNumber fontSize={isCompact ? "2xl" : "3xl"} fontWeight="bold" color={valueColor}>{value.toLocaleString()}</StatNumber>
          </Stat>
        </Box>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          rounded={'full'}
          bg={iconBg}
          w={16}
          h={16}
        >
          <Icon as={icon} w={9} h={9} color={iconColor} />
        </Flex>
      </Flex>
    </Box>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  p?: number | { base: number; md: number };
}

function QuickAction({ title, description, icon, href, color, p = 4 }: QuickActionProps) {
  return (
    <Box 
      as="a"
      href={href}
      bg={color}
      borderRadius="lg"
      p={p}
      color="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      shadow="md"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        opacity: 0.9
      }}
      height="100%"
    >
      <Icon as={icon} boxSize={10} mb={2} />
      <Text fontWeight="medium">{title}</Text>
      <Text fontSize="sm" color="gray.200">{description}</Text>
    </Box>
  );
}

export default function DashboardOverview() {
  const cardPadding = useBreakpointValue({ base: 3, md: 4 });
  const isCompact = useBreakpointValue({ base: true, md: false });
  
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
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setDashboardData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center p={10}>
          <Spinner size="xl" />
        </Center>
      );
    }

    if (error) {
      return (
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      );
    }

    if (dashboardData) {
      return (
        <GridContainer columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 4, md: 5 }} mb={8}>
          <StatCard 
            title="Total Grids" 
            value={dashboardData.totalGrids} 
            icon={FiDatabase} 
            iconBg="blue.500"
            isCompact={isCompact}
            p={cardPadding}
          />
          <StatCard 
            title="Total Tubes" 
            value={dashboardData.totalTubes} 
            icon={MdOutlineScience} 
            iconBg="green.500"
            isCompact={isCompact}
            p={cardPadding}
          />
          <StatCard 
            title="Low Inventory" 
            value={dashboardData.lowInventory} 
            icon={FiAlertTriangle} 
            iconBg="orange.500"
            isCompact={isCompact}
            p={cardPadding}
          />
          <StatCard 
            title="Expiring Soon" 
            value={dashboardData.expiringSoon} 
            icon={FiCalendar} 
            iconBg="purple.500"
            isCompact={isCompact}
            p={cardPadding}
          />
        </GridContainer>
      );
    }

    return null;
  };
  
  return (
    <DashboardSection title="Dashboard Overview" mb={8} fullWidth>
      {renderContent()}

      {/* Quick Actions */}
      <Box mb={6}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>Quick Actions</Heading>
        <GridContainer columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 4, md: 5 }}>
          <QuickAction 
            title="Create Grid"
            description="Add a new grid to your collection"
            icon={FiDatabase}
            href="/dashboard/create-grilla"
            color="blue.500"
            p={cardPadding}
          />
          <QuickAction 
            title="Manage Stock"
            description="View and update your inventory"
            icon={MdOutlineScience}
            href="/dashboard/inventory"
            color="green.500"
            p={cardPadding}
          />
          <QuickAction 
            title="View Logs"
            description="Check recent activity logs"
            icon={FiAlertTriangle}
            href="/dashboard/audit-log"
            color="purple.500"
            p={cardPadding}
          />
          <QuickAction 
            title="Account Settings"
            description="Manage your account and plan"
            icon={FiUsers}
            href="/dashboard/admin-cuenta"
            color="gray.500"
            p={cardPadding}
          />
        </GridContainer>
      </Box>
    </DashboardSection>
  );
}

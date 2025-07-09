import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Icon,
  Text,
  Button,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  HStack,
  VStack,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiTrendingUp, FiPackage, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import { DashboardSection } from './ResponsiveContainers';
import EnhancedReagentInventory from './EnhancedReagentInventory';
import EnhancedStockControl from './EnhancedStockControl';
import NextLink from 'next/link';

// Componente principal del Stock Manager mejorado
export default function EnhancedStockManager() {
  const { data: session } = useSession();
  const planType = session?.user?.planType || 'free';
  const { fetchWithAuth } = useFetchWithAuth();
  const [stockStats, setStockStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0,
    stockValue: 0,
    activeReagents: 0
  });
  const [tabIndex, setTabIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  
  // Color y breakpoint values para diseño responsivo
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const dangerColor = useColorModeValue('red.500', 'red.300');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Cargar estadísticas de inventario
  useEffect(() => {
    const fetchStockStats = async () => {
      if (planType === 'free') return;
      
      setIsLoading(true);
      try {
        // Llamada a la API para obtener estadísticas de stock
        const stats = await fetchWithAuth('/api/stock/stats');
        setStockStats(stats);
      } catch (error) {
        console.error("Error fetching stock statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockStats();
  }, [fetchWithAuth, planType]);

  // Mostrar mensaje de plan gratuito con opción de actualizar
  if (planType === 'free') {
    return (
      <DashboardSection>
        <Flex 
          direction="column" 
          alignItems="center" 
          justifyContent="center"
          py={12}
          px={6}
          textAlign="center"
          borderRadius="lg"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="gray.300"
          bg="gray.50"
          transition="all 0.3s ease"
          _hover={{ boxShadow: "md", borderColor: "brand.300" }}
        >
          <Icon as={FiPackage} boxSize={16} color="gray.400" mb={6} />
          <Heading size="md" mb={4} color="gray.700">
            Stock Manager
          </Heading>
          <Text color="gray.600" mb={8} maxW="md">
            Track reagent inventory, manage stock entries, and get low-stock alerts with our Stock Manager. 
            Available from the Standard plan.
          </Text>
          
          <HStack spacing={4}>
            <Button 
              as={NextLink} 
              href="/dashboard/admin-cuenta"
              colorScheme="brand" 
              size="lg"
            >
              Upgrade Plan
            </Button>
            <Button 
              variant="outline" 
              colorScheme="brand" 
              size="lg" 
              onClick={onOpen}
            >
              Learn More
            </Button>
          </HStack>
        </Flex>
        
        {/* Diálogo de más información */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Stock Manager Features
              </AlertDialogHeader>

              <AlertDialogBody>
                <VStack spacing={4} align="start">
                  <HStack>
                    <Icon as={FiPackage} color="brand.500" />
                    <Text>Complete reagent inventory management</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiAlertCircle} color="brand.500" />
                    <Text>Low stock alerts and notifications</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiCalendar} color="brand.500" />
                    <Text>Expiration date tracking and reminders</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiTrendingUp} color="brand.500" />
                    <Text>Usage analytics and stock level optimization</Text>
                  </HStack>
                </VStack>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button 
                  ref={cancelRef} 
                  onClick={onClose}
                  transition="all 0.2s ease"
                  _hover={{ bg: hoverBgColor }}
                >
                  Close
                </Button>
                <Button 
                  as={NextLink} 
                  href="/dashboard/admin-cuenta"
                  colorScheme="brand" 
                  ml={3}
                  transition="all 0.2s ease"
                  _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                  _active={{ transform: "translateY(0)" }}
                >
                  Upgrade Now
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection>
      {/* Stock Stats Overview */}
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" py={8}>
          <Spinner size="lg" color="brand.500" mr={3} />
          <Text>Loading statistics...</Text>
        </Flex>
      ) : (
      <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={5} mb={8}>
        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="sm"
          border="1px solid"
          borderColor={borderColor}
          rounded="lg"
          bg={bgColor}
        >
          <StatLabel fontWeight="medium" isTruncated>
            Total Items
          </StatLabel>
          <StatNumber fontSize="2xl">{stockStats.totalItems}</StatNumber>
          <StatHelpText mb={0}>
            <Text fontSize="sm">Entries in stock</Text>
          </StatHelpText>
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="sm"
          border="1px solid"
          borderColor={borderColor}
          rounded="lg"
          bg={bgColor}
        >
          <StatLabel fontWeight="medium" isTruncated>
            Active Reagents
          </StatLabel>
          <StatNumber fontSize="2xl">{stockStats.activeReagents}</StatNumber>
          <StatHelpText mb={0}>
            <Text fontSize="sm">Different reagents</Text>
          </StatHelpText>
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="sm"
          border="1px solid"
          borderColor="orange.100"
          rounded="lg"
          bg="orange.50"
          transition="all 0.3s ease"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
        >
          <StatLabel fontWeight="medium" isTruncated color="orange.600">
            Low Stock
          </StatLabel>
          <Flex alignItems="center">
            <StatNumber fontSize="2xl" color="orange.600">{stockStats.lowStock}</StatNumber>
            {stockStats.lowStock > 0 && (
              <Icon as={FiAlertTriangle} ml={2} color={warningColor} />
            )}
          </Flex>
          <StatHelpText mb={0} color="orange.600">
            <Text fontSize="sm">Requires attention</Text>
          </StatHelpText>
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="sm"
          border="1px solid"
          borderColor="red.100"
          rounded="lg"
          bg="red.50"
          transition="all 0.3s ease"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
        >
          <StatLabel fontWeight="medium" isTruncated color="red.600">
            Expiring Soon
          </StatLabel>
          <Flex alignItems="center">
            <StatNumber fontSize="2xl" color="red.600">{stockStats.expiringSoon}</StatNumber>
            {stockStats.expiringSoon > 0 && (
              <Icon as={FiAlertCircle} ml={2} color={dangerColor} />
            )}
          </Flex>
          <StatHelpText mb={0} color="red.600">
            <Text fontSize="sm">Within 30 days</Text>
          </StatHelpText>
        </Stat>

        <Stat
          px={{ base: 2, md: 4 }}
          py="5"
          shadow="sm"
          border="1px solid"
          borderColor={borderColor}
          rounded="lg"
          bg={bgColor}
        >
          <StatLabel fontWeight="medium" isTruncated>
            Estimated Value
          </StatLabel>
          <StatNumber fontSize="2xl">${stockStats.stockValue.toFixed(2)}</StatNumber>
          <StatHelpText mb={0}>
            <Text fontSize="sm">Current inventory</Text>
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      )}

      {/* Tabs para Inventory y Control */}
      <Box 
        bg={bgColor} 
        borderRadius="lg" 
        shadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        transition="all 0.3s ease"
        _hover={{ shadow: "md" }}
      >
        <Tabs 
          variant="enclosed-colored" 
          colorScheme="brand" 
          size={isMobile ? "sm" : "md"}
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
          isFitted={isMobile}
          isLazy
        >
          <TabList bg="gray.50" px={2} pt={2}>
            <Tab 
              _selected={{ 
                color: "brand.500", 
                bg: "white",
                fontWeight: "semibold",
                borderBottomColor: "white",
                borderTopColor: "brand.500",
                borderTopWidth: "3px"
              }}
              borderTopWidth="3px"
              borderTopColor="transparent"
              transition="all 0.2s"
              _hover={{ color: "brand.400" }}
            >
              Reagent Inventory
            </Tab>
            <Tab 
              _selected={{ 
                color: "brand.500", 
                bg: "white",
                fontWeight: "semibold",
                borderBottomColor: "white",
                borderTopColor: "brand.500",
                borderTopWidth: "3px"
              }}
              borderTopWidth="3px"
              borderTopColor="transparent"
              transition="all 0.2s"
              _hover={{ color: "brand.400" }}
            >
              Stock Control
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <EnhancedReagentInventory updateStats={() => setStockStats(prev => ({...prev}))} />
            </TabPanel>
            <TabPanel p={0}>
              <EnhancedStockControl updateStats={() => setStockStats(prev => ({...prev}))} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </DashboardSection>
  );
}

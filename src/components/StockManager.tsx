import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    VStack,
    Text,
    Button,
    Link,
    Flex,
    Heading,
    Icon,
    Badge,
    HStack,
    Card,
    CardBody,
    useColorModeValue,
    Tooltip
} from '@chakra-ui/react';
import { FiDatabase, FiActivity } from 'react-icons/fi';
import ReagentInventory from './ReagentInventory';
import StockControl from './StockControl';
import { DashboardSection } from './ResponsiveContainers';

export default function StockManager() {
    const { data: session } = useSession();
    const planType = session?.user?.planType || 'free';
    const [tabIndex, setTabIndex] = useState(0);

    // Theme colors for consistency
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const tabColor = useColorModeValue('gray.600', 'gray.400');

    if (planType === 'free') {
        return (
            <DashboardSection>
                <Card
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                    shadow="sm"
                    transition="all 0.3s"
                    _hover={{ shadow: 'md' }}
                >
                    <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
                        <Icon as={FiDatabase} boxSize={12} color="gray.400" mb={4} />
                        <Heading as="h3" size="md" color="gray.700" mb={3}>
                            Stock Management
                        </Heading>
                        <Text color="gray.600" mb={6} fontSize="md" maxW="md" textAlign="center">
                            Track your reagent inventory, manage stock levels, and get alerts for expiring items with our advanced Stock Manager.
                        </Text>
                        <Badge colorScheme="purple" fontSize="0.8em" mb={6} px={3} py={1}>
                            Standard Plan Feature
                        </Badge>
                        <Link href="/dashboard/admin-cuenta" _hover={{ textDecoration: 'none' }}>
                            <Button
                                colorScheme="brand"
                                size="md"
                                shadow="md"
                                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                                transition="all 0.2s"
                            >
                                Upgrade Plan
                            </Button>
                        </Link>
                    </CardBody>
                </Card>
            </DashboardSection>
        );
    }

    return (
        <DashboardSection>
            {/* Header with title */}
            <Flex justifyContent="space-between" alignItems="center" mb={6}>

                
                <HStack spacing={2}>
                    <Tooltip label="Overview of your current stock status" hasArrow placement="top">
                        <Badge colorScheme={tabIndex === 0 ? 'green' : 'gray'} px={2} py={1}>
                            {tabIndex === 0 ? 'Inventory View' : ''}
                        </Badge>
                    </Tooltip>
                    <Tooltip label="Detailed stock control by lot and expiration" hasArrow placement="top">
                        <Badge colorScheme={tabIndex === 1 ? 'blue' : 'gray'} px={2} py={1}>
                            {tabIndex === 1 ? 'Stock Control' : ''}
                        </Badge>
                    </Tooltip>
                </HStack>
            </Flex>

            {/* Main Content with Tabs */}
            <Box
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
                transition="all 0.3s"
                _hover={{ shadow: 'md' }}
            >
                <VStack spacing={0} align="stretch">
                    <Tabs 
                        colorScheme="brand" 
                        variant="enclosed" 
                        isFitted 
                        onChange={(index) => setTabIndex(index)}
                        index={tabIndex}
                    >
                        <TabList>
                            <Tab 
                                fontWeight="medium" 
                                color={tabColor}
                                _selected={{ color: 'brand.500', borderColor: 'brand.500', borderBottomColor: bgColor }} 
                                transition="all 0.2s"
                            >
                                <Flex align="center">
                                    <Icon as={FiActivity} mr={2} />
                                    Reagent Inventory
                                </Flex>
                            </Tab>
                            <Tab 
                                fontWeight="medium" 
                                color={tabColor}
                                _selected={{ color: 'brand.500', borderColor: 'brand.500', borderBottomColor: bgColor }} 
                                transition="all 0.2s"
                            >
                                <Flex align="center">
                                    <Icon as={FiDatabase} mr={2} />
                                    Stock Control
                                </Flex>
                            </Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel p={0}>
                                <Box p={4}>
                                    <ReagentInventory />
                                </Box>
                            </TabPanel>
                            <TabPanel p={0}>
                                <Box p={4}>
                                    <StockControl />
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Box>
        </DashboardSection>
    );
}


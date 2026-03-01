import { useState } from 'react';
import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    VStack,
    Flex,
    Icon,
    Badge,
    HStack,
    useColorModeValue,
    Tooltip
} from '@chakra-ui/react';
import { FiDatabase, FiActivity } from 'react-icons/fi';
import ReagentInventory from './ReagentInventory';
import StockControl from './StockControl';
import { DashboardSection } from './ResponsiveContainers';

export default function StockManager() {
    const [tabIndex, setTabIndex] = useState(0);

    // Theme colors for consistency
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const tabColor = useColorModeValue('gray.600', 'gray.400');

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

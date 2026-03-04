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

export default function StockManager() {
    const [tabIndex, setTabIndex] = useState(0);

    // Theme colors for consistency
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const tabColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box>
            {/* Header with title */}
            <Flex justifyContent="space-between" alignItems="center" mb={6}>

                
                <HStack spacing={2}>
                    <Tooltip label="Resumen del estado actual de stock" hasArrow placement="top">
                        <Badge colorScheme={tabIndex === 0 ? 'green' : 'gray'} px={2} py={1}>
                            {tabIndex === 0 ? 'Vista de inventario' : ''}
                        </Badge>
                    </Tooltip>
                    <Tooltip label="Control detallado por lote y vencimiento" hasArrow placement="top">
                        <Badge colorScheme={tabIndex === 1 ? 'blue' : 'gray'} px={2} py={1}>
                            {tabIndex === 1 ? 'Control de stock' : ''}
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
                                    Inventario de reactivos
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
                                    Control de stock
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
        </Box>
    );
}

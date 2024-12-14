import { useSession } from 'next-auth/react';
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
} from '@chakra-ui/react';
import ReagentInventory from './ReagentInventory';
import StockControl from './StockControl';

export default function StockManager() {
    const { data: session } = useSession();
    const planType = session?.user?.planType || 'free';

    if (planType === 'free') {
        return (
            <Box 
                bg="white" 
                p={10} 
                borderRadius="lg" 
                boxShadow="sm"
                textAlign="center"
            >
                <Text color="gray.600" mb={4} fontSize="lg">
                    Stock Manager is available from the Standard plan
                </Text>
                <Link href="/dashboard/admin-cuenta">
                    <Button colorScheme="teal" size="md">
                        Upgrade Plan
                    </Button>
                </Link>
            </Box>
        );
    }

    return (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
            <VStack spacing={6} align="stretch">
                <Tabs colorScheme="teal" variant="enclosed">
                    <TabList>
                        <Tab color="gray.500">Reagent Inventory</Tab>
                        <Tab color="gray.500">Stock Control</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <ReagentInventory />
                        </TabPanel>
                        <TabPanel>
                            <StockControl />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
} 
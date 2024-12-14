import {
    Box,
    VStack,
    Button,
    Select,
    FormControl,
    FormLabel,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Card,
    CardBody,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import { useSession } from 'next-auth/react';
import { Link } from '@chakra-ui/react';

interface Stock {
    id: string;
    reagentId: string;
    reagent: {
        name: string;
        unit: string;
    };
    disposalDate: string | null;
    isActive: boolean;
}

interface Reagent {
    id: string;
    name: string;
    unit: string;
}

interface AnalyticsPeriod {
    weekly: number;
    monthly: number;
    yearly: number;
}

export default function StockAnalytics() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [selectedReagent, setSelectedReagent] = useState<string>('all');
    const { fetchWithAuth } = useFetchWithAuth();
    const { data: session } = useSession();
    const planType = session?.user?.planType || 'free';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stocksData, reagentsData] = await Promise.all([
                    fetchWithAuth('/api/stock'),
                    fetchWithAuth('/api/reagents')
                ]);
                setStocks(stocksData);
                setReagents(reagentsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [fetchWithAuth]);

    const analytics = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        const filteredStocks = selectedReagent === 'all' 
            ? stocks 
            : stocks.filter(stock => stock.reagentId === selectedReagent);

        const disposedStocks = filteredStocks.filter(stock => !stock.isActive && stock.disposalDate);

        const result: Record<string, AnalyticsPeriod> = {};

        disposedStocks.forEach(stock => {
            const reagentName = stock.reagent.name;
            const disposalDate = new Date(stock.disposalDate!);

            if (!result[reagentName]) {
                result[reagentName] = {
                    weekly: 0,
                    monthly: 0,
                    yearly: 0
                };
            }

            if (disposalDate >= oneWeekAgo) {
                result[reagentName].weekly++;
            }
            if (disposalDate >= oneMonthAgo) {
                result[reagentName].monthly++;
            }
            if (disposalDate >= oneYearAgo) {
                result[reagentName].yearly++;
            }
        });

        return result;
    }, [stocks, selectedReagent]);

    if (planType !== 'premium') {
        return (
            <Box 
                bg="white" 
                p={6} 
                borderRadius="lg" 
                boxShadow="sm"
                textAlign="center"
            >
                <Text color="gray.600" mb={4}>
                    Stock Analytics is only available in the Premium plan
                </Text>
                <Link href="/dashboard/admin-cuenta">
                    <Button colorScheme="teal" size="sm">
                        Upgrade to Premium
                    </Button>
                </Link>
            </Box>
        );
    }

    return (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
            <VStack spacing={6} align="stretch">
                <FormControl maxW="300px">
                    <FormLabel color="gray.600">Filter by Reagent</FormLabel>
                    <Select
                        value={selectedReagent}
                        onChange={(e) => setSelectedReagent(e.target.value)}
                        bg="white"
                        color="gray.700"
                    >
                        <option value="all">All Reagents</option>
                        {reagents.map(reagent => (
                            <option key={reagent.id} value={reagent.id}>
                                {reagent.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <StatGroup>
                    <Card flex="1">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Weekly Disposals</StatLabel>
                                <StatNumber color="blue.500">
                                    {Object.values(analytics).reduce((sum, curr) => sum + curr.weekly, 0)}
                                </StatNumber>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card flex="1">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Monthly Disposals</StatLabel>
                                <StatNumber color="green.500">
                                    {Object.values(analytics).reduce((sum, curr) => sum + curr.monthly, 0)}
                                </StatNumber>
                            </Stat>
                        </CardBody>
                    </Card>
                    <Card flex="1">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.600">Yearly Disposals</StatLabel>
                                <StatNumber color="purple.500">
                                    {Object.values(analytics).reduce((sum, curr) => sum + curr.yearly, 0)}
                                </StatNumber>
                            </Stat>
                        </CardBody>
                    </Card>
                </StatGroup>

                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Reagent</Th>
                            <Th isNumeric>Weekly</Th>
                            <Th isNumeric>Monthly</Th>
                            <Th isNumeric>Yearly</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {Object.entries(analytics).map(([reagentName, data]) => (
                            <Tr key={reagentName}>
                                <Td fontWeight="bold" color="gray.700">{reagentName}</Td>
                                <Td isNumeric color="blue.500">{data.weekly}</Td>
                                <Td isNumeric color="green.500">{data.monthly}</Td>
                                <Td isNumeric color="purple.500">{data.yearly}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                {Object.keys(analytics).length === 0 && (
                    <Box textAlign="center" py={4}>
                        <Text color="gray.500">No disposal data available for the selected filter</Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
} 
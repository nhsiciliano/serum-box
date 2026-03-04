import {
    Box,
    VStack,
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
    SimpleGrid,
    Flex,
    Icon,
    useColorModeValue,
    Heading,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';
import { FiBarChart2, FiCalendar, FiTrendingUp, FiInfo } from 'react-icons/fi';

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

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
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

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <Stat
        p={4}
        bg={useColorModeValue('white', 'gray.700')}
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        borderRadius="lg"
        shadow="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
    >
        <Flex alignItems="center">
            <Box
                bg={`${color}.100`}
                borderRadius="full"
                p={3}
                mr={4}
            >
                <Icon as={icon} w={6} h={6} color={`${color}.500`} />
            </Box>
            <Box>
                <StatLabel color={useColorModeValue('gray.500', 'gray.400')} fontSize="sm">{title}</StatLabel>
                <StatNumber fontWeight="bold" fontSize="2xl" color="brand.600">{value}</StatNumber>
            </Box>
        </Flex>
    </Stat>
);

export default function StockAnalytics() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [selectedReagent, setSelectedReagent] = useState<string>('all');
    const { fetchWithAuth } = useFetchWithAuth();

    // Define colors and styles at the top level
    const hoverBg = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const selectBg = useColorModeValue('white', 'gray.700');
    const selectBorder = useColorModeValue('gray.300', 'gray.600');
    const emptyStateBg = useColorModeValue('gray.50', 'gray.800');

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

    return (
        <VStack spacing={6} align="stretch">
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={2}>
                <Heading as="h3" size="md" color={textColor} mb={{ base: 4, md: 0 }}>
                    Resumen de descartes
                </Heading>
                <FormControl maxW={{ base: '100%', md: '300px' }}>
                    <FormLabel htmlFor='reagent-filter' srOnly>Filtrar por reactivo</FormLabel>
                    <Select
                        id='reagent-filter'
                        value={selectedReagent}
                        onChange={(e) => setSelectedReagent(e.target.value)}
                        bg={selectBg}
                        borderColor={selectBorder}
                        color={textColor}
                        focusBorderColor="brand.500"
                    >
                        <option value="all">Todos los reactivos</option>
                        {reagents.map(reagent => (
                            <option key={reagent.id} value={reagent.id}>
                                {reagent.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                <StatCard 
                    title="Descartes semanales" 
                    value={Object.values(analytics).reduce((sum, curr) => sum + curr.weekly, 0)}
                    icon={FiCalendar}
                    color="teal"
                />
                <StatCard 
                    title="Descartes mensuales" 
                    value={Object.values(analytics).reduce((sum, curr) => sum + curr.monthly, 0)}
                    icon={FiTrendingUp}
                    color="teal"
                />
                <StatCard 
                    title="Descartes anuales" 
                    value={Object.values(analytics).reduce((sum, curr) => sum + curr.yearly, 0)}
                    icon={FiBarChart2}
                    color="teal"
                />
            </SimpleGrid>

            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Reactivo</Th>
                            <Th isNumeric>Semanal</Th>
                            <Th isNumeric>Mensual</Th>
                            <Th isNumeric>Anual</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {Object.entries(analytics).map(([reagentName, data]) => (
                            <Tr key={reagentName} _hover={{ bg: hoverBg }}>
                                <Td fontWeight="medium" color={textColor}>{reagentName}</Td>
                                <Td isNumeric color="teal.600">{data.weekly}</Td>
                                <Td isNumeric color="teal.600">{data.monthly}</Td>
                                <Td isNumeric color="teal.600">{data.yearly}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {Object.keys(analytics).length === 0 && (
                <Flex direction="column" align="center" justify="center" p={10} bg={emptyStateBg} borderRadius="lg">
                    <Icon as={FiInfo} boxSize={8} color="gray.400" />
                    <Text mt={4} fontSize="lg" color="gray.500">Sin datos de descarte</Text>
                    <Text color="gray.500">No hay datos de descarte para el filtro seleccionado.</Text>
                </Flex>
            )}
        </VStack>
    );
} 

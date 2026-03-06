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
    Spinner,
    Divider,
    Button,
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

interface UsageHistoryItem {
    id: string;
    reagentId: string;
    reagentName: string;
    lotNumber: string;
    usageStartedAt: string;
    usageEndedAt: string;
    disposedUnits: number;
    performanceDays: number;
}

interface TotalsByReagentItem {
    reagentId: string;
    reagentName: string;
    disposedUnits: number;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
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
            <Box bg={`${color}.100`} borderRadius="full" p={3} mr={4}>
                <Icon as={icon} w={6} h={6} color={`${color}.500`} />
            </Box>
            <Box>
                <StatLabel color={useColorModeValue('gray.500', 'gray.400')} fontSize="sm">{title}</StatLabel>
                <StatNumber fontWeight="bold" fontSize="2xl" color="brand.600">{value}</StatNumber>
            </Box>
        </Flex>
    </Stat>
);

const formatMonthLabel = (monthValue: string) => {
    const [year, month] = monthValue.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};

const formatDate = (dateValue: string) => new Date(dateValue).toLocaleDateString('es-AR');

export default function StockAnalytics() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [selectedReagent, setSelectedReagent] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [usageHistory, setUsageHistory] = useState<UsageHistoryItem[]>([]);
    const [totalsByReagent, setTotalsByReagent] = useState<TotalsByReagentItem[]>([]);
    const [isUsageHistoryLoading, setIsUsageHistoryLoading] = useState(true);

    const { fetchWithAuth } = useFetchWithAuth();

    const hoverBg = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const selectBg = useColorModeValue('white', 'gray.700');
    const selectBorder = useColorModeValue('gray.300', 'gray.600');
    const emptyStateBg = useColorModeValue('gray.50', 'gray.800');

    const monthOptions = useMemo(() => {
        const options: string[] = [];
        const current = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
            options.push(date.toISOString().slice(0, 7));
        }

        return options;
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stocksData, reagentsData] = await Promise.all([
                    fetchWithAuth('/api/stock'),
                    fetchWithAuth('/api/reagents'),
                ]);
                setStocks(stocksData);
                setReagents(reagentsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [fetchWithAuth]);

    useEffect(() => {
        const fetchUsageHistory = async () => {
            setIsUsageHistoryLoading(true);
            try {
                const response = await fetchWithAuth(`/api/stock/usage-history?month=${selectedMonth}`);
                setUsageHistory(response.items || []);
                setTotalsByReagent(response.totalsByReagent || []);
            } catch (error) {
                console.error('Error fetching usage history:', error);
                setUsageHistory([]);
                setTotalsByReagent([]);
            } finally {
                setIsUsageHistoryLoading(false);
            }
        };

        fetchUsageHistory();
    }, [fetchWithAuth, selectedMonth]);

    const analytics = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        const filteredStocks = selectedReagent === 'all'
            ? stocks
            : stocks.filter((stock) => stock.reagentId === selectedReagent);

        const disposedStocks = filteredStocks.filter((stock) => !stock.isActive && stock.disposalDate);
        const result: Record<string, AnalyticsPeriod> = {};

        disposedStocks.forEach((stock) => {
            const reagentName = stock.reagent.name;
            const disposalDate = new Date(stock.disposalDate || '');

            if (!result[reagentName]) {
                result[reagentName] = { weekly: 0, monthly: 0, yearly: 0 };
            }

            if (disposalDate >= oneWeekAgo) result[reagentName].weekly++;
            if (disposalDate >= oneMonthAgo) result[reagentName].monthly++;
            if (disposalDate >= oneYearAgo) result[reagentName].yearly++;
        });

        return result;
    }, [stocks, selectedReagent]);

    const usageHistoryByReagent = useMemo(() => {
        if (selectedReagent === 'all') return usageHistory;
        return usageHistory.filter((item) => item.reagentId === selectedReagent);
    }, [usageHistory, selectedReagent]);

    const totalsByReagentFiltered = useMemo(() => {
        if (selectedReagent === 'all') return totalsByReagent;
        return totalsByReagent.filter((item) => item.reagentId === selectedReagent);
    }, [totalsByReagent, selectedReagent]);

    const handleExportCsv = () => {
        const separator = ';';
        const escapeCell = (value: string | number) => {
            const text = String(value ?? '');
            const escaped = text.replace(/"/g, '""');
            return `"${escaped}"`;
        };

        const lines: string[] = [];

        lines.push(["Control mensual de lotes finalizados", formatMonthLabel(selectedMonth)].map(escapeCell).join(separator));
        lines.push('');

        lines.push(
            [
                'Reactivo',
                'Lote',
                'Se comenzó su uso',
                'Se finalizó su uso',
                'Rendimiento (días corridos)',
            ]
                .map(escapeCell)
                .join(separator)
        );

        usageHistoryByReagent.forEach((item) => {
            lines.push(
                [
                    item.reagentName,
                    item.lotNumber,
                    formatDate(item.usageStartedAt),
                    formatDate(item.usageEndedAt),
                    item.performanceDays,
                ]
                    .map(escapeCell)
                    .join(separator)
            );
        });

        lines.push('');
        lines.push(escapeCell('Unidades totales descartadas por reactivo'));
        lines.push([escapeCell('Reactivo'), escapeCell('Total descartado')].join(separator));

        totalsByReagentFiltered.forEach((item) => {
            lines.push([item.reagentName, item.disposedUnits].map(escapeCell).join(separator));
        });

        const csvContent = `\uFEFF${lines.join('\n')}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', `control_mensual_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <VStack spacing={6} align="stretch">
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={2}>
                <Heading as="h3" size="md" color={textColor} mb={{ base: 4, md: 0 }}>
                    Resumen de descartes
                </Heading>
                <FormControl maxW={{ base: '100%', md: '300px' }}>
                    <FormLabel htmlFor="reagent-filter" srOnly>Filtrar por reactivo</FormLabel>
                    <Select
                        id="reagent-filter"
                        value={selectedReagent}
                        onChange={(e) => setSelectedReagent(e.target.value)}
                        bg={selectBg}
                        borderColor={selectBorder}
                        color={textColor}
                        focusBorderColor="brand.500"
                    >
                        <option value="all">Todos los reactivos</option>
                        {reagents.map((reagent) => (
                            <option key={reagent.id} value={reagent.id}>{reagent.name}</option>
                        ))}
                    </Select>
                </FormControl>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                <StatCard title="Descartes semanales" value={Object.values(analytics).reduce((sum, curr) => sum + curr.weekly, 0)} icon={FiCalendar} color="teal" />
                <StatCard title="Descartes mensuales" value={Object.values(analytics).reduce((sum, curr) => sum + curr.monthly, 0)} icon={FiTrendingUp} color="teal" />
                <StatCard title="Descartes anuales" value={Object.values(analytics).reduce((sum, curr) => sum + curr.yearly, 0)} icon={FiBarChart2} color="teal" />
            </SimpleGrid>

            <Box
                p={5}
                bg={useColorModeValue('white', 'gray.700')}
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                borderRadius="lg"
                shadow="sm"
            >
                <VStack align="stretch" spacing={4}>
                    <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap={4}>
                        <Box>
                            <Heading as="h4" size="sm" color={textColor}>Control mensual de lotes finalizados</Heading>
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                                {formatMonthLabel(selectedMonth)}
                            </Text>
                        </Box>

                        <FormControl maxW={{ base: '100%', md: '220px' }}>
                            <FormLabel htmlFor="month-filter" srOnly>Filtrar por mes</FormLabel>
                            <Select
                                id="month-filter"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                bg={selectBg}
                                borderColor={selectBorder}
                                color={textColor}
                                focusBorderColor="brand.500"
                            >
                                {monthOptions.map((monthOption) => (
                                    <option key={monthOption} value={monthOption}>{formatMonthLabel(monthOption)}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            alignSelf={{ base: 'stretch', md: 'flex-end' }}
                            colorScheme="teal"
                            variant="outline"
                            onClick={handleExportCsv}
                            isDisabled={isUsageHistoryLoading || usageHistoryByReagent.length === 0}
                        >
                            Exportar a Excel (.csv)
                        </Button>
                    </Flex>

                    {isUsageHistoryLoading ? (
                        <Flex justify="center" py={8}><Spinner color="teal.500" /></Flex>
                    ) : usageHistoryByReagent.length > 0 ? (
                        <>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Reactivo</Th>
                                            <Th>Lote</Th>
                                            <Th>Se comenzó su uso</Th>
                                            <Th>Se finalizó su uso</Th>
                                            <Th isNumeric>Rendimiento (días corridos)</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {usageHistoryByReagent.map((item) => (
                                            <Tr key={item.id} _hover={{ bg: hoverBg }}>
                                                <Td color={textColor} fontWeight="medium">{item.reagentName}</Td>
                                                <Td color={textColor}>{item.lotNumber}</Td>
                                                <Td color={textColor}>{formatDate(item.usageStartedAt)}</Td>
                                                <Td color={textColor}>{formatDate(item.usageEndedAt)}</Td>
                                                <Td isNumeric color="teal.600">{item.performanceDays}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>

                            <Divider />

                            <Box>
                                <Heading as="h5" size="xs" color={textColor} mb={3}>
                                    Unidades totales descartadas por reactivo
                                </Heading>
                                <Box overflowX="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Reactivo</Th>
                                                <Th isNumeric>Total descartado</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {totalsByReagentFiltered.map((item) => (
                                                <Tr key={item.reagentId} _hover={{ bg: hoverBg }}>
                                                    <Td color={textColor}>{item.reagentName}</Td>
                                                    <Td isNumeric color="teal.600" fontWeight="semibold">{item.disposedUnits}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Flex direction="column" align="center" justify="center" p={8} bg={emptyStateBg} borderRadius="lg">
                            <Icon as={FiInfo} boxSize={7} color="gray.400" />
                            <Text mt={3} fontSize="lg" color="gray.500">Sin cierres de lotes en el mes seleccionado</Text>
                            <Text color="gray.500">Cuando descartes stock con fechas de uso, aparecerá el historial acá.</Text>
                        </Flex>
                    )}
                </VStack>
            </Box>
        </VStack>
    );
}

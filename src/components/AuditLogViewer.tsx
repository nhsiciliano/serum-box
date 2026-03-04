import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    HStack,
    Text,
    Button,
    Badge,
    Flex,
    useColorModeValue,
    Center,
    Spinner,
    VStack,
} from '@chakra-ui/react';
import { useFetchWithAuth } from '../hooks/useFetchWithAuth';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: {
        activeUser?: {
            name: string;
            email: string;
            isMainUser: boolean;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    createdAt: string;
    user: {
        name: string;
        email: string;
        isMainUser: boolean;
        mainUserId: string | null;
    };
    appliedBy: string;
    isSecondaryUser: boolean;
}

interface PaginationInfo {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
}

export const AuditLogViewer = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        pages: 0,
        currentPage: 1,
        limit: 10
    });
    const [entityType, setEntityType] = useState<string>('');
    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.200');
    const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
    const { fetchWithAuth } = useFetchWithAuth();
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = useCallback(async (page: number = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            if (entityType) params.append('entityType', entityType);

            const data = await fetchWithAuth(`/api/audit-logs?${params}`);
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [entityType, fetchWithAuth]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            CREATE_GRID: 'green',
            DELETE_GRID: 'red',
            CREATE_TUBE: 'blue',
            DELETE_TUBE: 'orange',
            CREATE_SECONDARY_USER: 'purple',
            DELETE_SECONDARY_USER: 'pink',
            EMPTY_GRID: 'yellow'
        };
        return colors[action] || 'gray';
    };

    const getActionText = (action: string): string => {
        const actions: Record<string, string> = {
            CREATE_GRID: 'Crear gradilla',
            DELETE_GRID: 'Eliminar gradilla',
            CREATE_TUBE: 'Agregar tubo',
            DELETE_TUBE: 'Quitar tubo',
            CREATE_SECONDARY_USER: 'Crear usuario',
            DELETE_SECONDARY_USER: 'Eliminar usuario',
            EMPTY_GRID: 'Vaciar gradilla'
        };
        return actions[action] || action;
    };

    return (
        <Box bg={bgColor} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
            <HStack mb={4} spacing={4}>
                <Select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    placeholder="Filtrar por tipo"
                    color="gray.600"
                    w="200px"
                    focusBorderColor="teal.400"
                >
                    <option value="GRID">Gradillas</option>
                    <option value="TUBE">Tubos</option>
                    <option value="USER">Usuarios</option>
                </Select>
            </HStack>

            {isLoading ? (
                <Center py={8}>
                    <VStack spacing={4}>
                        <Spinner size="xl" color="teal.500" thickness="4px" />
                        <Text color="gray.500">Cargando registros de auditoría...</Text>
                    </VStack>
                </Center>
            ) : (
                <>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Fecha</Th>
                                <Th>Aplicado por</Th>
                                <Th>Acción</Th>
                                <Th>Detalle</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {logs.map((log) => (
                                <Tr key={log.id}>
                                    <Td color="gray.600">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </Td>
                                    <Td color="gray.600">
                                        <Text>
                                            {log.appliedBy}
                                            {log.isSecondaryUser && ' (Secundario)'}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={getActionColor(log.action)}>
                                            {getActionText(log.action)}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color={textColor}>
                                            {JSON.stringify(
                                                {...log.details, activeUser: undefined},
                                                null,
                                                2
                                            )}
                                        </Text>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    <Flex justify="center" mt={4}>
                        {Array.from({ length: pagination.pages }, (_, i) => (
                            <Button
                                key={i + 1}
                                size="sm"
                                variant={pagination.currentPage === i + 1 ? "solid" : "outline"}
                                onClick={() => fetchLogs(i + 1)}
                                mx={1}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </Flex>
                </>
            )}
        </Box>
    );
};

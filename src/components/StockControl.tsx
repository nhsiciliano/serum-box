import {
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Select,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Badge,
    IconButton,
    Tooltip,
    Box,
    Text,
    HStack,
    Flex,
    InputGroup,
    InputLeftElement,
    Icon,
    Card,
    CardBody,
    TableContainer,
    useColorModeValue,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Heading,
    SimpleGrid,
    Spinner,
    Tag,
    TagLabel,
    TagLeftIcon,
    VStack
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, SearchIcon, CheckIcon } from '@chakra-ui/icons';
import { FiDatabase, FiCalendar, FiAlertTriangle, FiPackage, FiClock } from 'react-icons/fi';
import { useMemo, useState, useEffect } from 'react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

interface Stock {
    id: string;
    reagentId: string;
    reagent: {
        name: string;
        unit: string;
    };
    quantity: number;
    lotNumber: string;
    expirationDate: string;
    entryDate: string;
    isActive: boolean;
    disposalDate?: string;
    durationDays?: number;
}

interface Reagent {
    id: string;
    name: string;
    unit: string;
}

const EXPIRING_THRESHOLD_DAYS = 60;

export default function StockControl() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDisposeModalOpen,
        onOpen: onDisposeModalOpen,
        onClose: onDisposeModalClose,
    } = useDisclosure();
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [formData, setFormData] = useState({
        reagentId: '',
        quantity: '',
        lotNumber: '',
        expirationDate: '',
        notes: ''
    });
    const [stats, setStats] = useState({ total: 0, expiringSoon: 0, expired: 0, disposed: 0, lowStock: 0 });
    const { fetchWithAuth } = useFetchWithAuth();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disposed'>('all');
    const [reagentFilter, setReagentFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStockForDispose, setSelectedStockForDispose] = useState<Stock | null>(null);
    const [disposeForm, setDisposeForm] = useState({
        usageStartedAt: '',
        usageEndedAt: '',
    });
    const [isDisposing, setIsDisposing] = useState(false);
    
    // Theme colors
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const thColor = useColorModeValue('gray.600', 'gray.400');
    const tdColor = useColorModeValue('gray.800', 'gray.200');
    const labelColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [stocksData, reagentsData] = await Promise.all([
                    fetchWithAuth('/api/stock'),
                    fetchWithAuth('/api/reagents')
                ]);
                setStocks(stocksData);
                setReagents(reagentsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: 'No se pudieron cargar los datos de stock',
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [fetchWithAuth, toast]);

    useEffect(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const thresholdDate = new Date(startOfToday);
        thresholdDate.setDate(startOfToday.getDate() + EXPIRING_THRESHOLD_DAYS);
        thresholdDate.setHours(23, 59, 59, 999);

        const activeStocks = stocks.filter(s => s.isActive);

        const expiringSoonCount = activeStocks.filter(stock => {
            const expirationDate = new Date(stock.expirationDate);
            return expirationDate >= startOfToday && expirationDate <= thresholdDate;
        }).length;

        const expiredCount = stocks.filter(stock => {
            const expirationDate = new Date(stock.expirationDate);
            return expirationDate < startOfToday;
        }).length;

        const disposedCount = stocks.filter(s => !s.isActive).length;

        setStats({
            total: activeStocks.length,
            expiringSoon: expiringSoonCount,
            expired: expiredCount,
            disposed: disposedCount,
            lowStock: 0 // Placeholder for future implementation
        });
    }, [stocks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetchWithAuth('/api/stock', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setStocks(prev => [...prev, ...response]);
            onClose();
            setFormData({
                reagentId: '',
                quantity: '',
                lotNumber: '',
                expirationDate: '',
                notes: ''
            });
            
            toast({
                title: 'Éxito',
                description: `Se agregaron ${response.length} registros de stock correctamente`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: 'No se pudieron agregar los registros de stock',
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDisposeModal = (stock: Stock) => {
        const today = new Date().toISOString().slice(0, 10);
        const entryDate = stock.entryDate
            ? new Date(stock.entryDate).toISOString().slice(0, 10)
            : today;

        setSelectedStockForDispose(stock);
        setDisposeForm({
            usageStartedAt: entryDate,
            usageEndedAt: today,
        });
        onDisposeModalOpen();
    };

    const handleDisposeSubmit = async () => {
        if (!selectedStockForDispose) {
            return;
        }

        if (!disposeForm.usageStartedAt || !disposeForm.usageEndedAt) {
            toast({
                title: 'Error',
                description: 'Completá fecha de inicio y fecha de finalización.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (new Date(disposeForm.usageStartedAt) > new Date(disposeForm.usageEndedAt)) {
            toast({
                title: 'Error',
                description: 'La fecha de inicio no puede ser posterior a la fecha de finalización.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsDisposing(true);
        try {
            const response = await fetchWithAuth(`/api/stock/${selectedStockForDispose.id}/dispose`, {
                method: 'POST',
                body: JSON.stringify({
                    usageStartedAt: disposeForm.usageStartedAt,
                    usageEndedAt: disposeForm.usageEndedAt,
                }),
            });

            if (!response.success) {
                throw new Error('No se pudo descartar el stock');
            }

            setStocks((prev) =>
                prev.map((stock) =>
                    stock.id === selectedStockForDispose.id
                        ? {
                            ...stock,
                            isActive: false,
                            entryDate: response.stock.entryDate,
                            disposalDate: response.stock.disposalDate,
                            durationDays: response.stock.durationDays,
                        }
                        : stock
                )
            );

            onDisposeModalClose();
            setSelectedStockForDispose(null);

            toast({
                title: 'Éxito',
                description: 'Stock descartado correctamente',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'No se pudo descartar el stock',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsDisposing(false);
        }
    };

    const filteredStocks = stocks.filter(stock => {
        const matchesStatus = 
            statusFilter === 'all' ? true :
            statusFilter === 'active' ? stock.isActive :
            !stock.isActive;
            
        const matchesReagent = 
            reagentFilter === 'all' ? true :
            stock.reagentId === reagentFilter;

        return matchesStatus && matchesReagent;
    });

    const expiringReagentNotifications = useMemo(() => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const thresholdDate = new Date(startOfToday);
        thresholdDate.setDate(startOfToday.getDate() + EXPIRING_THRESHOLD_DAYS);
        thresholdDate.setHours(23, 59, 59, 999);

        const uniqueByReagent = new Map<string, { reagentName: string; daysRemaining: number; lotNumber: string }>();

        stocks
            .filter((stock) => stock.isActive)
            .forEach((stock) => {
                const expirationDate = new Date(stock.expirationDate);
                if (expirationDate < startOfToday || expirationDate > thresholdDate) {
                    return;
                }

                if (!uniqueByReagent.has(stock.reagentId)) {
                    const msPerDay = 1000 * 60 * 60 * 24;
                    const daysRemaining = Math.ceil(
                        (expirationDate.getTime() - startOfToday.getTime()) / msPerDay
                    );

                    uniqueByReagent.set(stock.reagentId, {
                        reagentName: stock.reagent?.name || 'Reactivo',
                        daysRemaining,
                        lotNumber: stock.lotNumber,
                    });
                }
            });

        return Array.from(uniqueByReagent.values()).sort((a, b) => a.daysRemaining - b.daysRemaining);
    }, [stocks]);

    const handleExportActiveStockCsv = () => {
        const separator = ';';
        const escapeCell = (value: string | number) => {
            const text = String(value ?? '');
            const escaped = text.replace(/"/g, '""');
            return `"${escaped}"`;
        };

        const activeStocks = stocks
            .filter((stock) => stock.isActive)
            .sort(
                (a, b) =>
                    new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
            );

        const lines: string[] = [];
        lines.push(
            [
                'Reactivo',
                'Unidad',
                'Cantidad',
                'Número de lote',
                'Fecha de vencimiento',
                'Estado',
            ]
                .map(escapeCell)
                .join(separator)
        );

        activeStocks.forEach((stock) => {
            lines.push(
                [
                    stock.reagent?.name || 'Desconocido',
                    stock.reagent?.unit || '',
                    stock.quantity,
                    stock.lotNumber,
                    stock.expirationDate
                        ? new Date(stock.expirationDate).toLocaleDateString('es-AR')
                        : '-',
                    'Activo',
                ]
                    .map(escapeCell)
                    .join(separator)
            );
        });

        const csvContent = `\uFEFF${lines.join('\n')}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.setAttribute('download', `stock_activo_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    
    return (
        <VStack spacing={5} align="stretch">
            {/* Header con título y botón de añadir */}
            <Flex justifyContent="space-between" alignItems="center">
                <Heading as="h4" size="md" color={tdColor}>
                    Control de stock
                </Heading>
                
                <HStack spacing={2}>
                    <InputGroup maxW="250px">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Buscar stock..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                            borderRadius="md"
                        />
                    </InputGroup>
                    
                    <Tooltip label="Agregar registro de stock" hasArrow placement="top">
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="brand"
                            size="md"
                            onClick={onOpen}
                            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            Agregar
                        </Button>
                    </Tooltip>

                    <Tooltip label="Exportar stock activo" hasArrow placement="top">
                        <Button
                            variant="outline"
                            colorScheme="teal"
                            size="md"
                            onClick={handleExportActiveStockCsv}
                            isDisabled={stocks.filter((stock) => stock.isActive).length === 0}
                        >
                            Exportar stock activo (.csv)
                        </Button>
                    </Tooltip>
                </HStack>
            </Flex>
            
            {/* Tarjetas de estadísticas */}
            {expiringReagentNotifications.length > 0 && (
                <Alert status="warning" borderRadius="lg" borderWidth="1px" borderColor="orange.200" bg={bgColor}>
                    <AlertIcon />
                    <Box>
                        <AlertTitle color={tdColor}>
                            {expiringReagentNotifications.length === 1
                                ? 'Tenés 1 reactivo próximo a vencer'
                                : `Tenés ${expiringReagentNotifications.length} reactivos próximos a vencer`}
                        </AlertTitle>
                        <AlertDescription color={labelColor}>
                            {expiringReagentNotifications
                                .slice(0, 3)
                                .map((item) => `${item.reagentName} (lote ${item.lotNumber}, ${item.daysRemaining} días)`)
                                .join(' - ')}
                        </AlertDescription>
                    </Box>
                </Alert>
            )}

            {/* Tarjetas de estadísticas */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
                <Card
                    p={4}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                    transition="all 0.3s"
                    _hover={{ shadow: 'md' }}
                >
                    <CardBody p={0} display="flex" alignItems="center">
                        <Icon as={FiDatabase} boxSize={8} color="blue.500" mr={4} />
                        <Box>
                            <Text fontSize="sm" color={thColor}>Stock activo</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={tdColor}>{stats.total}</Text>
                        </Box>
                    </CardBody>
                </Card>
                
                <Card
                    p={4}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                    transition="all 0.3s"
                    _hover={{ shadow: 'md' }}
                >
                    <CardBody p={0} display="flex" alignItems="center">
                        <Icon as={FiAlertTriangle} boxSize={8} color="yellow.500" mr={4} />
                        <Box>
                            <Text fontSize="sm" color={thColor}>Próximos a vencer</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={tdColor}>{stats.expiringSoon}</Text>
                        </Box>
                    </CardBody>
                </Card>
                
                <Card
                    p={4}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                    transition="all 0.3s"
                    _hover={{ shadow: 'md' }}
                >
                    <CardBody p={0} display="flex" alignItems="center">
                        <Icon as={FiClock} boxSize={8} color="red.500" mr={4} />
                        <Box>
                            <Text fontSize="sm" color={thColor}>Vencidos</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={tdColor}>{stats.expired}</Text>
                        </Box>
                    </CardBody>
                </Card>
                
                <Card
                    p={4}
                    bg={bgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    shadow="sm"
                    transition="all 0.3s"
                    _hover={{ shadow: 'md' }}
                >
                    <CardBody p={0} display="flex" alignItems="center">
                        <Icon as={FiPackage} boxSize={8} color="gray.500" mr={4} />
                        <Box>
                            <Text fontSize="sm" color={thColor}>Descartados</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={tdColor}>{stats.disposed}</Text>
                        </Box>
                    </CardBody>
                </Card>
            </SimpleGrid>
            
            {/* Filtros */}
            <Flex wrap="wrap" gap={4} mb={4}>
                <Box>
                    <VStack direction="row" spacing={2} align="center">
                        <Text fontWeight="medium" color={labelColor}>Estado:</Text>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disposed')}
                            w="150px"
                            size="sm"
                            color={labelColor}
                            borderRadius="md"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Activos</option>
                            <option value="disposed">Descartados</option>
                        </Select>
                    </VStack>
                </Box>
                
                <Box>
                    <VStack direction="row" spacing={2} align="center">
                        <Text fontWeight="medium" color={labelColor}>Reactivo:</Text>
                        <Select
                            value={reagentFilter}
                            onChange={(e) => setReagentFilter(e.target.value)}
                            w="180px"
                            size="sm"
                            color={labelColor}
                            borderRadius="md"
                        >
                            <option value="all">Todos los reactivos</option>
                            {reagents.map(reagent => (
                                <option key={reagent.id} value={reagent.id}>{reagent.name}</option>
                            ))}
                        </Select>
                    </VStack>
                </Box>
                
                {/* Etiquetas activas de filtro */}
                {statusFilter !== 'all' && (
                    <Tag size="sm" variant="subtle" colorScheme={statusFilter === 'active' ? 'green' : 'red'} borderRadius="md">
                        <TagLeftIcon as={statusFilter === 'active' ? CheckIcon : DeleteIcon} />
                        <TagLabel>{statusFilter === 'active' ? 'Solo activos' : 'Solo descartados'}</TagLabel>
                    </Tag>
                )}
                
                {reagentFilter !== 'all' && (
                    <Tag size="sm" variant="subtle" colorScheme="blue" borderRadius="md">
                        <TagLeftIcon as={FiPackage} />
                        <TagLabel>
                            {reagents.find(r => r.id === reagentFilter)?.name || 'Reactivo seleccionado'}
                        </TagLabel>
                    </Tag>
                )}
            </Flex>

            {/* Tabla de stocks */}
            {isLoading ? (
                <Flex justifyContent="center" py={8}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Flex>
            ) : filteredStocks.length > 0 ? (
                <Box
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                    shadow="sm"
                    bg={bgColor}
                >
                    <TableContainer>
                        <Table variant="simple" size="md">
                            <Thead bg={hoverBg}>
                                <Tr>
                                    <Th color={thColor}>Reactivo</Th>
                                    <Th color={thColor}>Cantidad</Th>
                                    <Th color={thColor}>Número de lote</Th>
                                    <Th color={thColor}>Fecha de vencimiento</Th>
                                    <Th color={thColor}>Estado</Th>
                                    <Th color={thColor} width="80px" textAlign="center">Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredStocks.map(stock => {
                                    // Calcular días hasta expiración
                                    const todayStart = new Date();
                                    todayStart.setHours(0, 0, 0, 0);

                                    const daysToExpire = stock.expirationDate
                                        ? Math.ceil((new Date(stock.expirationDate).getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))
                                        : null;
                                    
                                    return (
                                        <Tr 
                                            key={stock.id}
                                            _hover={{ bg: hoverBg }}
                                            transition="background-color 0.2s"
                                        >
                                            <Td fontWeight="medium" color={tdColor}>{stock.reagent?.name || 'Desconocido'}</Td>
                                            <Td color={tdColor}>{stock.quantity} {stock.reagent?.unit || ''}</Td>
                                            <Td color={tdColor}>{stock.lotNumber}</Td>
                                            <Td color={tdColor}>
                                                <HStack>
                                                    <Icon as={FiCalendar} color="gray.500" />
                                                    <Text>{stock.expirationDate ? new Date(stock.expirationDate).toLocaleDateString() : '-'}</Text>
                                                    
                                                    {daysToExpire !== null && daysToExpire <= EXPIRING_THRESHOLD_DAYS && daysToExpire > 0 && (
                                                        <Badge colorScheme="yellow" variant="subtle" borderRadius="full" px={2}>
                                                            Faltan {daysToExpire} días
                                                        </Badge>
                                                    )}
                                                    {daysToExpire !== null && daysToExpire <= 0 && (
                                                        <Badge colorScheme="red" variant="subtle" borderRadius="full" px={2}>
                                                            Vencido
                                                        </Badge>
                                                    )}
                                                </HStack>
                                            </Td>
                                            <Td color={tdColor}>
                                                <Badge 
                                                    colorScheme={stock.isActive ? "green" : "red"}
                                                    variant="subtle"
                                                    borderRadius="full"
                                                    px={2}
                                                >
                                                    {stock.isActive ? 'Activo' : 'Descartado'}
                                                </Badge>
                                            </Td>
                                            <Td color={tdColor} textAlign="center">
                                                {stock.isActive && (
                                                    <Tooltip label="Descartar stock" hasArrow placement="top">
                                                        <IconButton
                                                            aria-label="Descartar stock"
                                                            icon={<DeleteIcon />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => openDisposeModal(stock)}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <Alert status="info" borderRadius="md" color="gray.600">
                    <AlertIcon />
                    {searchTerm || statusFilter !== 'all' || reagentFilter !== 'all' ? 
                        'No hay registros de stock para esos filtros' : 
                        'Todavía no hay registros de stock'}
                </Alert>
            )}

            {/* Modal para añadir stock */}
            <Modal 
                isOpen={isOpen} 
                onClose={onClose}
                motionPreset="slideInBottom"
            >
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="lg" shadow="xl">
                    <ModalHeader color="gray.700">Agregar registro de stock</ModalHeader>
                    <ModalCloseButton color="gray.700"/>
                    <ModalBody pb={6}>
                        <form id="add-stock-form" onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="medium" color={labelColor}>Reactivo</FormLabel>
                                    <Select
                                        value={formData.reagentId}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            reagentId: e.target.value
                                        }))}
                                        placeholder="Seleccionar reactivo"
                                        color={labelColor}
                                        focusBorderColor="brand.500"
                                        size="md"
                                        borderRadius="md"
                                    >
                                        {reagents.map(reagent => (
                                            <option key={reagent.id} value={reagent.id}>
                                                {reagent.name} ({reagent.unit})
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="medium" color={labelColor}>Cantidad</FormLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.quantity}
                                        borderRadius="md"
                                        focusBorderColor="brand.500"
                                        color={labelColor}
                                        size="md"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            quantity: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="medium" color={labelColor}>Número de lote</FormLabel>
                                    <Input
                                        value={formData.lotNumber}
                                        borderRadius="md"
                                        focusBorderColor="brand.500"
                                        size="md"
                                        color={labelColor}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            lotNumber: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="medium" color={labelColor}>Fecha de vencimiento</FormLabel>
                                    <Input
                                        type="date"
                                        borderRadius="md"
                                        focusBorderColor="brand.500"
                                        size="md"
                                        color={labelColor}
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            expirationDate: e.target.value
                                        }))}
                                    />
                                </FormControl>
                            </VStack>
                        </form>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button 
                            type="submit" 
                            form="add-stock-form"
                            colorScheme="teal" 
                            isLoading={isSubmitting} 
                            loadingText="Agregando"
                            leftIcon={<AddIcon />}
                        >
                            Agregar registro
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isDisposeModalOpen} onClose={onDisposeModalClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="lg" shadow="xl">
                    <ModalHeader color="gray.700">Finalizar uso de lote</ModalHeader>
                    <ModalCloseButton color="gray.700" />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Text color={labelColor} fontSize="sm">
                                {selectedStockForDispose
                                    ? `${selectedStockForDispose.reagent.name} - Lote ${selectedStockForDispose.lotNumber}`
                                    : ''}
                            </Text>

                            <FormControl isRequired>
                                <FormLabel color={labelColor}>Se comenzó su uso</FormLabel>
                                <Input
                                    type="date"
                                    value={disposeForm.usageStartedAt}
                                    onChange={(e) =>
                                        setDisposeForm((prev) => ({
                                            ...prev,
                                            usageStartedAt: e.target.value,
                                        }))
                                    }
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color={labelColor}>Se finalizó su uso</FormLabel>
                                <Input
                                    type="date"
                                    value={disposeForm.usageEndedAt}
                                    onChange={(e) =>
                                        setDisposeForm((prev) => ({
                                            ...prev,
                                            usageEndedAt: e.target.value,
                                        }))
                                    }
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button variant="ghost" onClick={onDisposeModalClose}>Cancelar</Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDisposeSubmit}
                            isLoading={isDisposing}
                            loadingText="Guardando"
                        >
                            Confirmar descarte
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}

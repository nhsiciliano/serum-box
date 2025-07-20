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
import { useState, useEffect } from 'react';
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

export default function StockControl() {
    const { isOpen, onOpen, onClose } = useDisclosure();
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
                    description: "Could not fetch stock data",
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
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const activeStocks = stocks.filter(s => s.isActive);

        const expiringSoonCount = activeStocks.filter(stock => {
            const expirationDate = new Date(stock.expirationDate);
            return expirationDate >= now && expirationDate <= thirtyDaysFromNow;
        }).length;

        const expiredCount = stocks.filter(stock => {
            const expirationDate = new Date(stock.expirationDate);
            return expirationDate < now;
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
                title: "Success",
                description: `${response.length} stock entries added successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not add stock entries",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispose = async (stockId: string) => {
        try {
            toast({
                title: "Confirm Disposal",
                description: "Are you sure you want to dispose this stock entry?",
                status: "warning",
                duration: null,
                isClosable: true,
                position: "top",
                render: ({ onClose }) => (
                    <Box p={3} bg="white" borderRadius="md" boxShadow="md">
                        <VStack spacing={4}>
                            <Text color="gray.700">Are you sure you want to dispose this stock entry?</Text>
                            <HStack spacing={4}>
                                <Button
                                    colorScheme="red"
                                    onClick={async () => {
                                        onClose();
                                        const response = await fetchWithAuth(`/api/stock/${stockId}/dispose`, {
                                            method: 'POST'
                                        });

                                        if (response.success) {
                                            // Eliminar el elemento de la lista
                                            setStocks(prev => prev.filter(stock => stock.id !== stockId));
                                            
                                            toast({
                                                title: "Success",
                                                description: "Stock disposed successfully",
                                                status: "success",
                                                duration: 3000,
                                                isClosable: true,
                                            });
                                        } else {
                                            throw new Error('Failed to dispose stock');
                                        }
                                    }}
                                >
                                    Dispose
                                </Button>
                                <Button onClick={onClose}>Cancel</Button>
                            </HStack>
                        </VStack>
                    </Box>
                )
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not dispose stock",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
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


    
    return (
        <VStack spacing={5} align="stretch">
            {/* Header con título y botón de añadir */}
            <Flex justifyContent="space-between" alignItems="center">
                <Heading as="h4" size="md" color={tdColor}>
                    Stock Control
                </Heading>
                
                <HStack spacing={2}>
                    <InputGroup maxW="250px">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search stocks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                            borderRadius="md"
                        />
                    </InputGroup>
                    
                    <Tooltip label="Add new stock entry" hasArrow placement="top">
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="brand"
                            size="md"
                            onClick={onOpen}
                            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            Add
                        </Button>
                    </Tooltip>
                </HStack>
            </Flex>
            
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
                            <Text fontSize="sm" color={thColor}>Active Stock</Text>
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
                            <Text fontSize="sm" color={thColor}>Expiring Soon</Text>
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
                            <Text fontSize="sm" color={thColor}>Expired</Text>
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
                            <Text fontSize="sm" color={thColor}>Disposed</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={tdColor}>{stats.disposed}</Text>
                        </Box>
                    </CardBody>
                </Card>
            </SimpleGrid>
            
            {/* Filtros */}
            <Flex wrap="wrap" gap={4} mb={4}>
                <Box>
                    <VStack direction="row" spacing={2} align="center">
                        <Text fontWeight="medium" color={labelColor}>Status:</Text>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disposed')}
                            w="150px"
                            size="sm"
                            color={labelColor}
                            borderRadius="md"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="disposed">Disposed</option>
                        </Select>
                    </VStack>
                </Box>
                
                <Box>
                    <VStack direction="row" spacing={2} align="center">
                        <Text fontWeight="medium" color={labelColor}>Reagent:</Text>
                        <Select
                            value={reagentFilter}
                            onChange={(e) => setReagentFilter(e.target.value)}
                            w="180px"
                            size="sm"
                            color={labelColor}
                            borderRadius="md"
                        >
                            <option value="all">All Reagents</option>
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
                        <TagLabel>{statusFilter === 'active' ? 'Active Only' : 'Disposed Only'}</TagLabel>
                    </Tag>
                )}
                
                {reagentFilter !== 'all' && (
                    <Tag size="sm" variant="subtle" colorScheme="blue" borderRadius="md">
                        <TagLeftIcon as={FiPackage} />
                        <TagLabel>
                            {reagents.find(r => r.id === reagentFilter)?.name || 'Selected Reagent'}
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
                                    <Th color={thColor}>Reagent</Th>
                                    <Th color={thColor}>Quantity</Th>
                                    <Th color={thColor}>Lot Number</Th>
                                    <Th color={thColor}>Expiration Date</Th>
                                    <Th color={thColor}>Status</Th>
                                    <Th color={thColor} width="80px" textAlign="center">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredStocks.map(stock => {
                                    // Calcular días hasta expiración
                                    const daysToExpire = stock.expirationDate ? 
                                        Math.ceil((new Date(stock.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                                        null;
                                    
                                    return (
                                        <Tr 
                                            key={stock.id}
                                            _hover={{ bg: hoverBg }}
                                            transition="background-color 0.2s"
                                        >
                                            <Td fontWeight="medium" color={tdColor}>{stock.reagent?.name || 'Unknown'}</Td>
                                            <Td color={tdColor}>{stock.quantity} {stock.reagent?.unit || ''}</Td>
                                            <Td color={tdColor}>{stock.lotNumber}</Td>
                                            <Td color={tdColor}>
                                                <HStack>
                                                    <Icon as={FiCalendar} color="gray.500" />
                                                    <Text>{stock.expirationDate ? new Date(stock.expirationDate).toLocaleDateString() : '-'}</Text>
                                                    
                                                    {daysToExpire && daysToExpire < 30 && daysToExpire > 0 && (
                                                        <Badge colorScheme="yellow" variant="subtle" borderRadius="full" px={2}>
                                                            {daysToExpire} days left
                                                        </Badge>
                                                    )}
                                                    {daysToExpire && daysToExpire <= 0 && (
                                                        <Badge colorScheme="red" variant="subtle" borderRadius="full" px={2}>
                                                            Expired
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
                                                    {stock.isActive ? 'Active' : 'Disposed'}
                                                </Badge>
                                            </Td>
                                            <Td color={tdColor} textAlign="center">
                                                {stock.isActive && (
                                                    <Tooltip label="Dispose stock" hasArrow placement="top">
                                                        <IconButton
                                                            aria-label="Dispose stock"
                                                            icon={<DeleteIcon />}
                                                            size="sm"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => handleDispose(stock.id)}
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
                        "No stock entries match your filters" : 
                        "No stock entries added yet"}
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
                    <ModalHeader color="gray.700">Add Stock Entry</ModalHeader>
                    <ModalCloseButton color="gray.700"/>
                    <ModalBody pb={6}>
                        <form id="add-stock-form" onSubmit={handleSubmit}>
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="medium" color={labelColor}>Reagent</FormLabel>
                                    <Select
                                        value={formData.reagentId}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            reagentId: e.target.value
                                        }))}
                                        placeholder="Select reagent"
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
                                    <FormLabel fontWeight="medium" color={labelColor}>Quantity</FormLabel>
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
                                    <FormLabel fontWeight="medium" color={labelColor}>Lot Number</FormLabel>
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
                                    <FormLabel fontWeight="medium" color={labelColor}>Expiration Date</FormLabel>
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
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button 
                            type="submit" 
                            form="add-stock-form"
                            colorScheme="teal" 
                            isLoading={isSubmitting} 
                            loadingText="Adding"
                            leftIcon={<AddIcon />}
                        >
                            Add Entry
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
import {
    VStack,
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
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
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
    const { fetchWithAuth } = useFetchWithAuth();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disposed'>('all');
    const [reagentFilter, setReagentFilter] = useState<string>('all');

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
                toast({
                    title: "Error",
                    description: "Could not fetch stock data",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        };

        fetchData();
    }, [fetchWithAuth, toast]);

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
        <VStack spacing={4} align="stretch">
            <HStack spacing={4} justify="space-between">
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="teal"
                    onClick={onOpen}
                >
                    Add Stock Entry
                </Button>

                <HStack spacing={4}>
                    <FormControl maxW="200px">
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disposed')}
                            bg="white"
                            color="gray.700"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="disposed">Disposed</option>
                        </Select>
                    </FormControl>

                    <FormControl maxW="200px">
                        <Select
                            value={reagentFilter}
                            onChange={(e) => setReagentFilter(e.target.value)}
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
                </HStack>
            </HStack>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Reagent</Th>
                        <Th>Quantity</Th>
                        <Th>Lot Number</Th>
                        <Th>Expiration Date</Th>
                        <Th>Entry Date</Th>
                        <Th>Status</Th>
                        <Th>Disposal Info</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {filteredStocks.map((stock) => (
                        <Tr key={stock.id}>
                            <Td fontWeight="bold" color="gray.600">{stock.reagent.name}</Td>
                            <Td color="gray.600">1 {stock.reagent.unit}</Td>
                            <Td color="gray.600">{stock.lotNumber}</Td>
                            <Td color="gray.600">{new Date(stock.expirationDate).toLocaleDateString()}</Td>
                            <Td color="gray.600">{new Date(stock.entryDate).toLocaleDateString()}</Td>
                            <Td>
                                <Badge 
                                    colorScheme={stock.isActive ? 'green' : 'red'}
                                >
                                    {stock.isActive ? 'Active' : 'Disposed'}
                                </Badge>
                            </Td>
                            <Td>
                                {stock.disposalDate && (
                                    <Text color="gray.600">
                                        {new Date(stock.disposalDate).toLocaleDateString()}
                                        {stock.durationDays && ` (${stock.durationDays} days)`}
                                    </Text>
                                )}
                            </Td>
                            <Td>
                                {stock.isActive && (
                                    <Tooltip label="Dispose Stock">
                                        <IconButton
                                            aria-label="Dispose stock"
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => handleDispose(stock.id)}
                                        />
                                    </Tooltip>
                                )}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {filteredStocks.length === 0 && (
                <Box textAlign="center" py={4}>
                    <Text color="gray.500">No stocks found with the selected filters</Text>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color="gray.500">Add Stock Entry</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel color="gray.500">Reagent</FormLabel>
                                    <Select
                                        value={formData.reagentId}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            reagentId: e.target.value
                                        }))}
                                        placeholder="Select reagent"
                                        color="gray.500"
                                    >
                                        {reagents.map(reagent => (
                                            <option key={reagent.id} value={reagent.id}>
                                                {reagent.name} ({reagent.unit})
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel color="gray.500">Quantity</FormLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.quantity}
                                        color="gray.500"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            quantity: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel color="gray.500">Lot Number</FormLabel>
                                    <Input
                                        value={formData.lotNumber}
                                        color="gray.500"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            lotNumber: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel color="gray.500">Expiration Date</FormLabel>
                                    <Input
                                        type="date"
                                        color="gray.500"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            expirationDate: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <Button type="submit" marginBottom={4} colorScheme="teal" width="full" isLoading={isSubmitting} loadingText="Adding">
                                    Add
                                </Button>
                            </VStack>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
} 
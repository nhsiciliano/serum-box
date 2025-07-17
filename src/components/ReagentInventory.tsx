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
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Box,
    Text,
    HStack,
    Spinner,
    Flex,
    InputGroup,
    InputLeftElement,
    Icon,
    Badge,
    Tooltip,
    TableContainer,
    useColorModeValue,
    Alert,
    AlertIcon,
    Heading,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    SimpleGrid,
    Card,
    CardBody,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiDatabase, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

interface Reagent {
    id: string;
    name: string;
    description: string;
    unit: string;
    lowStockAlert?: number;
    totalStock?: number;
}

export default function ReagentInventory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [currentReagent, setCurrentReagent] = useState<Reagent | null>(null);
    const [reagentToDelete, setReagentToDelete] = useState<string | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const { fetchWithAuth } = useFetchWithAuth();
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unit: '',
        lowStockAlert: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, lowStock: 0 });

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const iconColor = useColorModeValue('gray.600', 'gray.400');
    const textColor = useColorModeValue('gray.800', 'gray.200');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const thColor = useColorModeValue('gray.600', 'gray.400');
    const tdColor = useColorModeValue('gray.800', 'gray.200');
    const labelColor = useColorModeValue('gray.600', 'gray.300');
    const theadBgColor = useColorModeValue('gray.50', 'gray.900');

    const fetchReagents = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchWithAuth('/api/reagents');
            setReagents(data);
        } catch (error) {
            console.error('Error fetching reagents:', error);
            toast({
                title: "Error",
                description: "Could not fetch reagents",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithAuth, toast]);

    useEffect(() => {
        fetchReagents();
    }, [fetchReagents]);

    const handleOpenModal = (reagent: Reagent | null) => {
        setCurrentReagent(reagent);
        if (reagent) {
            setFormData({
                name: reagent.name,
                description: reagent.description,
                unit: reagent.unit,
                lowStockAlert: reagent.lowStockAlert || 0
            });
        } else {
            setFormData({
                name: '',
                description: '',
                unit: '',
                lowStockAlert: 0
            });
        }
        onOpen();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = currentReagent ? `/api/reagents/${currentReagent.id}` : '/api/reagents';
        const method = currentReagent ? 'PUT' : 'POST';

        try {
            await fetchWithAuth(url, {
                method: method,
                body: JSON.stringify(formData)
            });

            fetchReagents();
            onClose();
            toast({
                title: "Success",
                description: `Reagent ${currentReagent ? 'updated' : 'added'} successfully`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error(`Error ${currentReagent ? 'updating' : 'adding'} reagent:`, error);
            toast({
                title: "Error",
                description: `Could not ${currentReagent ? 'update' : 'add'} reagent`,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (reagentId: string) => {
        setReagentToDelete(reagentId);
        onAlertOpen();
    };

    const confirmDelete = async () => {
        if (reagentToDelete) {
            try {
                await fetchWithAuth(`/api/reagents/${reagentToDelete}`, { method: 'DELETE' });
                toast({
                    title: 'Reagent Deleted',
                    description: 'The reagent has been successfully deleted.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchReagents(); // Refresh the list
            } catch (error) {
                console.error('Error deleting reagent:', error);
                toast({
                    title: 'Error',
                    description: 'Could not delete the reagent.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
            onAlertClose();
            setReagentToDelete(null);
        }
    };

    const filteredReagents = useMemo(() => {
        return reagents.filter(reagent =>
            reagent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reagent.description && reagent.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [reagents, searchTerm]);

    useEffect(() => {
        const total = filteredReagents.length;
        const lowStockCount = filteredReagents.filter(
            r => r.lowStockAlert && r.lowStockAlert > 0 && r.totalStock && r.totalStock <= r.lowStockAlert
        ).length;
        setStats({ total, lowStock: lowStockCount });
    }, [filteredReagents]);

    if (isLoading) {
        return (
            <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" color="brand.500" />
            </Flex>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between" wrap="wrap" gap={4}>
                <Heading as="h2" size="md" fontWeight="semibold" color={textColor}>
                    Reagent Catalog
                </Heading>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    onClick={() => handleOpenModal(null)}
                    _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                    transition="all 0.2s"
                >
                    Add New Reagent
                </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                    <CardBody>
                        <HStack align="center">
                            <Icon as={FiDatabase} boxSize={8} color="blue.500" />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Total Reagents</Text>
                                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.total}</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
                <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                    <CardBody>
                        <HStack align="center">
                            <Icon as={FiAlertTriangle} boxSize={8} color="orange.500" />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Low Stock</Text>
                                <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.lowStock}</Text>
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="Search reagents by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    focusBorderColor="brand.400"
                    bg={bgColor}
                />
            </InputGroup>

            {filteredReagents.length > 0 ? (
                <Box>
                    <TableContainer borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                        <Table variant="simple">
                            <Thead bg={theadBgColor}>
                                <Tr>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Name</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Description</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Unit</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Stock Status</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm" textAlign="center">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredReagents.map((reagent) => (
                                    <Tr 
                                        key={reagent.id}
                                        _hover={{ bg: hoverBg }}
                                        transition="background-color 0.2s"
                                    >
                                        <Td color={tdColor} fontWeight="medium">{reagent.name}</Td>
                                        <Td color={tdColor}>{reagent.description || <Text as="i" color="gray.500" fontSize="sm">No description</Text>}</Td>
                                        <Td>
                                            <Badge colorScheme="blue" fontSize="0.8em">{reagent.unit}</Badge>
                                        </Td>
                                        <Td>
                                            {(reagent.lowStockAlert ?? 0) > 0 && (reagent.totalStock ?? 0) <= (reagent.lowStockAlert ?? 0) ? (
                                                <Tooltip label={`Stock is at or below the threshold of ${reagent.lowStockAlert}`} hasArrow placement="top">
                                                    <Badge colorScheme="orange" fontSize="0.8em">Low Stock</Badge>
                                                </Tooltip>
                                            ) : (
                                                <Badge colorScheme="green" fontSize="0.8em">In Stock</Badge>
                                            )}
                                        </Td>
                                        <Td>
                                            <HStack spacing={2} justifyContent="center">
                                                <Tooltip label="Edit reagent" hasArrow placement="top">
                                                    <IconButton
                                                        aria-label="Edit reagent"
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenModal(reagent)}
                                                    />
                                                </Tooltip>
                                                <Tooltip label="Delete reagent" hasArrow placement="top">
                                                    <IconButton
                                                        aria-label="Delete reagent"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteClick(reagent.id)}
                                                    />
                                                </Tooltip>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <Alert status="info" borderRadius="md" bg={bgColor} borderColor={borderColor} borderWidth="1px">
                    <AlertIcon color={iconColor} />
                    <Text color={textColor}>{searchTerm ? "No reagents match your search" : "No reagents added yet. Click 'Add New Reagent' to start."}</Text>
                </Alert>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent shadow="xl" borderRadius="lg">
                    <ModalHeader bg={bgColor} borderTopRadius="lg" py={4}>
                        <HStack>
                            <Icon as={FiDatabase} color="brand.500" />
                            <Text fontWeight="semibold" fontSize="lg" color={textColor}>
                                {currentReagent ? `Edit ${currentReagent.name}` : 'Add New Reagent'}
                            </Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.700"/>
                    <ModalBody pt={5} pb={6}>
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontWeight="medium" color={labelColor}>Reagent Name</FormLabel>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter reagent name"
                                    color={labelColor}
                                    focusBorderColor="brand.500"
                                    size="md"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontWeight="medium" color={labelColor}>Description</FormLabel>
                                <Input 
                                    value={formData.description || ''} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Enter description (optional)"
                                    color={labelColor}
                                    focusBorderColor="brand.500"
                                    size="md"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontWeight="medium" color={labelColor}>Unit</FormLabel>
                                <Input 
                                    value={formData.unit} 
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    placeholder="e.g., mL, g, mg"
                                    color={labelColor}
                                    focusBorderColor="brand.500"
                                    size="md"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontWeight="medium" color={labelColor}>Low Stock Alert</FormLabel>
                                <NumberInput 
                                    value={formData.lowStockAlert}
                                    onChange={(valueString) => setFormData({...formData, lowStockAlert: parseInt(valueString) || 0})}
                                    min={0}
                                    focusBorderColor="brand.500"
                                >
                                    <NumberInputField color={labelColor} />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <Text fontSize="xs" color="gray.400" mt={1}>Set a threshold to get a warning when stock is low.</Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg={bgColor} borderBottomRadius="lg" gap={3}>
                        <Button onClick={onClose} variant="outline">Cancel</Button>
                        <Button 
                            colorScheme="brand" 
                            onClick={handleSubmit} 
                            isLoading={isSubmitting}
                            loadingText={currentReagent ? "Updating" : "Adding"}
                            _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            {currentReagent ? 'Update' : 'Add'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Reagent
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this reagent? All associated stock will also be deleted. This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
}
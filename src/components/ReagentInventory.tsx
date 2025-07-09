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
    Card,
    CardBody,
    Tooltip,
    TableContainer,
    useColorModeValue,
    Alert,
    AlertIcon,
    Heading,
    SimpleGrid
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from '@chakra-ui/icons';
import { FiDatabase, FiInfo } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

interface Reagent {
    id: string;
    name: string;
    description: string;
    unit: string;
}

export default function ReagentInventory() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [reagents, setReagents] = useState<Reagent[]>([]);
    const [currentReagent, setCurrentReagent] = useState<Reagent | null>(null);
    const { fetchWithAuth } = useFetchWithAuth();
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unit: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Theme colors
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const thColor = useColorModeValue('gray.600', 'gray.400');
    const tdColor = useColorModeValue('gray.800', 'gray.200');
    const labelColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        const fetchReagents = async () => {
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
        };

        fetchReagents();
    }, [fetchWithAuth, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetchWithAuth('/api/reagents', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setReagents(prev => [...prev, response]);
            onClose();
            setFormData({ name: '', description: '', unit: '' });
            
            toast({
                title: "Success",
                description: "Reagent added successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not add reagent",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reagentId: string) => {
        try {
            toast({
                title: "Confirm Deletion",
                description: "Are you sure you want to delete this reagent?",
                status: "warning",
                duration: null,
                isClosable: true,
                position: "top",
                render: ({ onClose }) => (
                    <Box p={3} bg="white" borderRadius="md" boxShadow="md">
                        <VStack spacing={4}>
                            <Text color="gray.700">Are you sure you want to delete this reagent?</Text>
                            <HStack spacing={4}>
                                <Button
                                    colorScheme="red"
                                    onClick={async () => {
                                        onClose();
                                        const response = await fetchWithAuth(`/api/reagents/${reagentId}`, {
                                            method: 'DELETE'
                                        });

                                        if (response.error === 'Cannot delete reagent with existing stock entries') {
                                            toast({
                                                title: "Cannot Delete",
                                                description: "This reagent has existing stock entries. Please remove all stock entries first.",
                                                status: "warning",
                                                duration: 5000,
                                                isClosable: true,
                                            });
                                            return;
                                        }

                                        if (!response.success) {
                                            throw new Error(response.error);
                                        }

                                        setReagents(prev => prev.filter(r => r.id !== reagentId));
                                        
                                        toast({
                                            title: "Success",
                                            description: "Reagent deleted successfully",
                                            status: "success",
                                            duration: 3000,
                                            isClosable: true,
                                        });
                                    }}
                                >
                                    Delete
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
                description: "Could not delete reagent",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const filteredReagents = reagents.filter(reagent =>
        reagent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reagent.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const stats = {
        total: reagents.length,
        withDescription: reagents.filter(r => r.description && r.description.trim() !== '').length
    };

    return (
        <VStack spacing={4} align="stretch">
            <Flex justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={3}>
                <Heading as="h4" size="md" color="gray.700">
                    Reagent Catalog
                </Heading>
                
                <HStack spacing={2}>
                    <InputGroup maxW="250px">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search reagents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="md"
                            borderRadius="md"
                        />
                    </InputGroup>
                    
                    <Tooltip label="Add new reagent" hasArrow placement="top">
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="brand"
                            size="md"
                            onClick={() => {
                                setCurrentReagent(null);
                                setFormData({
                                    name: '',
                                    description: '',
                                    unit: ''
                                });
                                onOpen();
                            }}
                            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            Add
                        </Button>
                    </Tooltip>
                </HStack>
            </Flex>
            
            <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4} mb={4}>
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
                            <Text fontSize="sm" color="gray.500">Total Reagents</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.700">{stats.total}</Text>
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
                        <Icon as={FiInfo} boxSize={8} color="purple.500" mr={4} />
                        <Box>
                            <Text fontSize="sm" color="gray.500">With Descriptions</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="gray.700">{stats.withDescription}</Text>
                        </Box>
                    </CardBody>
                </Card>
            </SimpleGrid>
            
            {isLoading ? (
                <Flex justifyContent="center" py={8}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Flex>
            ) : filteredReagents.length > 0 ? (
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
                                    <Th color={thColor}>Name</Th>
                                    <Th color={thColor}>Description</Th>
                                    <Th color={thColor}>Unit</Th>
                                    <Th color={thColor} width="120px" textAlign="center">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredReagents.map(reagent => (
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
                                            <HStack spacing={2} justifyContent="center">
                                                <Tooltip label="Edit reagent" hasArrow placement="top">
                                                    <IconButton
                                                        aria-label="Edit reagent"
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setCurrentReagent(reagent);
                                                            setFormData(reagent);
                                                            onOpen();
                                                        }}
                                                    />
                                                </Tooltip>
                                                <Tooltip label="Delete reagent" hasArrow placement="top">
                                                    <IconButton
                                                        aria-label="Delete reagent"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(reagent.id)}
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
                <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    {searchTerm ? "No reagents match your search" : "No reagents added yet"}
                </Alert>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent shadow="xl" borderRadius="lg">
                    <ModalHeader bg={useColorModeValue('gray.50', 'gray.800')} borderTopRadius="lg" py={4}>
                        <HStack>
                            <Icon as={currentReagent ? EditIcon : AddIcon} color={currentReagent ? "blue.500" : "green.500"} />
                            <Text color={labelColor}>
                                {currentReagent ? `Edit ${currentReagent.name}` : 'Add New Reagent'}
                            </Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pt={5} pb={6}>
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontWeight="medium" color={labelColor}>Reagent Name</FormLabel>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter reagent name"
                                    color={labelColor}
                                    focusBorderColor="brand.400"
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
                                    focusBorderColor="brand.400"
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
                                    focusBorderColor="brand.400"
                                    size="md"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg={useColorModeValue('gray.50', 'gray.800')} borderBottomRadius="lg" gap={3}>
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
        </VStack>
    );
}
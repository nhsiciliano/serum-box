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
    FormControl,
    FormLabel,
    Input,
    useToast,
    Box,
    Text,
    HStack,
    Spinner,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
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

    useEffect(() => {
        const fetchReagents = async () => {
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

    return (
        <VStack spacing={4} align="stretch">
            <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                onClick={onOpen}
            >
                Add New Reagent
            </Button>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Description</Th>
                        <Th>Unit</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reagents.map((reagent) => (
                        <Tr key={reagent.id}>
                            <Td fontWeight="bold" color="gray.600">{reagent.name}</Td>
                            <Td color="gray.600">{reagent.description}</Td>
                            <Td color="gray.600">{reagent.unit}</Td>
                            <Td>
                                <IconButton
                                    aria-label="Edit reagent"
                                    icon={<EditIcon />}
                                    size="sm"
                                    colorScheme="blue"
                                    mr={2}
                                    onClick={() => {
                                        setCurrentReagent(reagent);
                                        setFormData(reagent);
                                        onOpen();
                                    }}
                                />
                                <IconButton
                                    aria-label="Delete reagent"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleDelete(reagent.id)}
                                />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color="gray.500">
                        {currentReagent ? 'Edit Reagent' : 'Add New Reagent'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel color="gray.500">Name</FormLabel>
                                    <Input
                                        value={formData.name}
                                        color="gray.500"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel color="gray.500">Description</FormLabel>
                                    <Input
                                        value={formData.description}
                                        color="gray.500"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel color="gray.500">Unit</FormLabel>
                                    <Input
                                        value={formData.unit}
                                        color="gray.500"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            unit: e.target.value
                                        }))}
                                        placeholder="e.g., ml, g, units"
                                    />
                                </FormControl>
                                <Button 
                                    type="submit" 
                                    colorScheme="teal"
                                    marginBottom={4}
                                    width="full"
                                    isLoading={isSubmitting}
                                    loadingText="Adding"
                                    spinner={<Spinner />}
                                >
                                    {currentReagent ? 'Update' : 'Add'}
                                </Button>
                            </VStack>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
} 
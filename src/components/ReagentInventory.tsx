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
                description: 'No se pudieron cargar los reactivos',
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
                title: 'Éxito',
                description: `Reactivo ${currentReagent ? 'actualizado' : 'agregado'} correctamente`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error(`Error ${currentReagent ? 'actualizando' : 'agregando'} reactivo:`, error);
            toast({
                title: "Error",
                description: `No se pudo ${currentReagent ? 'actualizar' : 'agregar'} el reactivo`,
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
                    title: 'Reactivo eliminado',
                    description: 'El reactivo se eliminó correctamente.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchReagents(); // Refresh the list
            } catch (error) {
                console.error('Error deleting reagent:', error);
                toast({
                    title: 'Error',
                    description: 'No se pudo eliminar el reactivo.',
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
                    Catálogo de reactivos
                </Heading>
                <Button
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    onClick={() => handleOpenModal(null)}
                    _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                    transition="all 0.2s"
                >
                    Agregar reactivo
                </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                    <CardBody>
                        <HStack align="center">
                            <Icon as={FiDatabase} boxSize={8} color="blue.500" />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Total de reactivos</Text>
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
                                <Text fontSize="sm" color="gray.500">Stock bajo</Text>
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
                    placeholder="Buscar reactivos por nombre o descripción..."
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
                                    <Th color={thColor} textTransform="none" fontSize="sm">Nombre</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Descripción</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Unidad</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm">Estado de stock</Th>
                                    <Th color={thColor} textTransform="none" fontSize="sm" textAlign="center">Acciones</Th>
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
                                        <Td color={tdColor}>{reagent.description || <Text as="i" color="gray.500" fontSize="sm">Sin descripción</Text>}</Td>
                                        <Td>
                                            <Badge colorScheme="blue" fontSize="0.8em">{reagent.unit}</Badge>
                                        </Td>
                                        <Td>
                                            {(reagent.lowStockAlert ?? 0) > 0 && (reagent.totalStock ?? 0) <= (reagent.lowStockAlert ?? 0) ? (
                                                <Tooltip label={`El stock está en o por debajo del umbral de ${reagent.lowStockAlert}`} hasArrow placement="top">
                                                    <Badge colorScheme="orange" fontSize="0.8em">Stock bajo</Badge>
                                                </Tooltip>
                                            ) : (
                                                <Badge colorScheme="green" fontSize="0.8em">En stock</Badge>
                                            )}
                                        </Td>
                                        <Td>
                                            <HStack spacing={2} justifyContent="center">
                                                <Tooltip label="Editar reactivo" hasArrow placement="top">
                                                    <IconButton
                                                        aria-label="Editar reactivo"
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenModal(reagent)}
                                                    />
                                                </Tooltip>
                                                <Tooltip label="Eliminar reactivo" hasArrow placement="top">
                                                    <IconButton
                                                        aria-label="Eliminar reactivo"
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
                    <Text color={textColor}>{searchTerm ? 'No hay reactivos para esa búsqueda' : "Todavía no hay reactivos. Hacé clic en 'Agregar reactivo' para empezar."}</Text>
                </Alert>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent shadow="xl" borderRadius="lg">
                    <ModalHeader bg={bgColor} borderTopRadius="lg" py={4}>
                        <HStack>
                                <Icon as={FiDatabase} color="brand.500" />
                                <Text fontWeight="semibold" fontSize="lg" color={textColor}>
                                    {currentReagent ? `Editar ${currentReagent.name}` : 'Agregar reactivo'}
                                </Text>
                            </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="gray.700"/>
                    <ModalBody pt={5} pb={6}>
                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontWeight="medium" color={labelColor}>Nombre del reactivo</FormLabel>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ingresá el nombre del reactivo"
                                    color={labelColor}
                                    focusBorderColor="brand.500"
                                    size="md"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontWeight="medium" color={labelColor}>Descripción</FormLabel>
                                <Input 
                                    value={formData.description || ''} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Ingresá una descripción (opcional)"
                                    color={labelColor}
                                    focusBorderColor="brand.500"
                                    size="md"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontWeight="medium" color={labelColor}>Unidad</FormLabel>
                                <Input 
                                    value={formData.unit} 
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    placeholder="Ej: mL, g, mg"
                                    color={labelColor}
                                    focusBorderColor="brand.500"
                                    size="md"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontWeight="medium" color={labelColor}>Alerta de stock bajo</FormLabel>
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
                                <Text fontSize="xs" color="gray.400" mt={1}>Definí un umbral para recibir alerta cuando el stock sea bajo.</Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg={bgColor} borderBottomRadius="lg" gap={3}>
                        <Button onClick={onClose} variant="outline">Cancelar</Button>
                        <Button 
                            colorScheme="brand" 
                            onClick={handleSubmit} 
                            isLoading={isSubmitting}
                            loadingText={currentReagent ? 'Actualizando' : 'Agregando'}
                            _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            {currentReagent ? 'Actualizar' : 'Agregar'}
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
                            Eliminar reactivo
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Seguro que querés eliminar este reactivo? También se eliminará todo el stock asociado. Esta acción no se puede deshacer.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                Eliminar
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
}

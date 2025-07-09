"use client"

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Box, Text, Button, VStack, Flex, useToast, Spinner, Table, Thead, Tbody, Tr, Th, Td, Container,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
    InputGroup, InputLeftElement, Input, Grid, Heading, useColorModeValue
} from '@chakra-ui/react';
import { SearchIcon, InfoIcon } from '@chakra-ui/icons';
import { FiMapPin, FiThermometer } from 'react-icons/fi';
import GrillaVisualization from '@/components/GrillaVisualization';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

interface Tube {
    id: string;
    position: string;
    data: Record<string, string>;
}

interface Gradilla {
    id: string;
    name: string;
    description?: string;
    storagePlace?: string;
    temperature?: string;
    rows: string[];
    columns: number[];
    fields: string[];
    tubes: Tube[];
}

export default function GradillaDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [gradilla, setGradilla] = useState<Gradilla | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEmptying, setIsEmptying] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { fetchWithAuth } = useFetchWithAuth();
    
    // Definir todos los valores de color para evitar hooks condicionales
    const bgWhite = useColorModeValue('white', 'gray.800');
    const borderColorValue = useColorModeValue('gray.200', 'gray.700');
    const headerBg = useColorModeValue('purple.50', 'purple.900');
    const headerBorderColor = useColorModeValue('purple.100', 'purple.800');
    const headingColor = useColorModeValue('purple.600', 'purple.200');
    const cardBg = useColorModeValue('gray.50', 'gray.700');
    const infoIconColor = useColorModeValue('blue.500', 'blue.300');
    const mapPinColor = useColorModeValue('green.500', 'green.300');
    const thermometerColor = useColorModeValue('orange.500', 'orange.300');
    const labelColor = useColorModeValue('gray.600', 'gray.300');
    const contentColor = useColorModeValue('gray.700', 'gray.200');
    const modalHeaderColor = useColorModeValue('gray.700', 'gray.200');
    const searchIconColor = useColorModeValue('gray.300', 'gray.500');
    const inputTextColor = useColorModeValue('gray.800', 'gray.100');
    const tableHeaderColor = useColorModeValue('blue.700', 'blue.300');
    const tableCellColor = useColorModeValue('gray.700', 'gray.300');
    const noResultsColor = useColorModeValue('gray.500', 'gray.400');

    useEffect(() => {
        const fetchGradilla = async () => {
            try {
                const data = await fetchWithAuth(`/api/gradillas/${params.id}`);
                setGradilla(data);
            } catch (error) {
                console.error('Error:', error);
                router.push('/dashboard');
            }
        };

        fetchGradilla();
    }, [params.id, router, fetchWithAuth]);

    const handleDeleteGrilla = async () => {
        setIsDeleting(true);
        try {
            await fetchWithAuth(`/api/gradillas/${params.id}`, {
                method: 'DELETE'
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not delete grid. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddTube = (newTube: Tube) => {
        setGradilla(prev => prev ? {
            ...prev,
            tubes: [...prev.tubes, newTube]
        } : null);
    };

    const handleRemoveTube = (tubeId: string) => {
        setGradilla(prev => {
            if (!prev) return null;
            const updatedTubes = prev.tubes.filter(t => t.id !== tubeId);
            return {
                ...prev,
                tubes: updatedTubes
            };
        });
    };

    const handleEmptyGradilla = async () => {
        setIsEmptying(true);
        try {
            await fetchWithAuth(`/api/gradillas/${params.id}/tubes`, {
                method: 'DELETE',
                headers: {
                    'x-active-user-id': localStorage.getItem('currentUserId') || ''
                }
            });
            setGradilla(prev => prev ? { ...prev, tubes: [] } : null);
            toast({
                title: "Grid emptied",
                description: "All tubes have been removed from the grid.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not empty grid. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsEmptying(false);
        }
    };

    const filteredTubes = useMemo(() => {
        if (!gradilla) return [];
        return gradilla.tubes.filter(tube => {
            if (searchTerm === '') return true;
            
            // Buscar en la posición
            if (tube.position.toLowerCase().includes(searchTerm.toLowerCase())) return true;
            
            // Buscar en todos los campos de datos
            return Object.values(tube.data).some(value => 
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [gradilla, searchTerm]);

    if (!gradilla) return <Text color={contentColor}>Loading...</Text>;

    return (
        <Container maxW="container.xl" py={6}>
            <VStack spacing={6} align="stretch">
                <Box 
                    bg={bgWhite}
                    borderRadius="xl" 
                    boxShadow="md" 
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColorValue}
                    transition="all 0.3s"
                    _hover={{ boxShadow: 'lg' }}
                >
                    <Box 
                        bg={headerBg}
                        py={4} 
                        px={6} 
                        borderBottom="1px" 
                        borderColor={headerBorderColor}
                    >
                        <Heading 
                            as="h1" 
                            size="lg" 
                            color={headingColor}
                            fontWeight="600"
                        >
                            {gradilla.name}
                        </Heading>
                    </Box>
                    
                    <Box p={6}>
                        <Grid 
                            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} 
                            gap={8}
                        >
                            {gradilla.description && (
                                <Box 
                                    p={4} 
                                    borderRadius="md" 
                                    bg={cardBg}
                                    transition="transform 0.2s"
                                    _hover={{ transform: 'translateY(-2px)' }}
                                >
                                    <Flex align="center" mb={2}>
                                        <Box 
                                            as={InfoIcon} 
                                            color={infoIconColor}
                                            mr={2}
                                        />
                                        <Text 
                                            fontWeight="600" 
                                            color={labelColor}
                                            fontSize="sm"
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                        >
                                            Descripción
                                        </Text>
                                    </Flex>
                                    <Text color={contentColor}>
                                        {gradilla.description}
                                    </Text>
                                </Box>
                            )}
                            
                            {gradilla.storagePlace && (
                                <Box 
                                    p={4} 
                                    borderRadius="md" 
                                    bg={cardBg}
                                    transition="transform 0.2s"
                                    _hover={{ transform: 'translateY(-2px)' }}
                                >
                                    <Flex align="center" mb={2}>
                                        <Box 
                                            as={FiMapPin} 
                                            color={mapPinColor}
                                            mr={2}
                                        />
                                        <Text 
                                            fontWeight="600" 
                                            color={labelColor}
                                            fontSize="sm"
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                        >
                                            Ubicación
                                        </Text>
                                    </Flex>
                                    <Text color={contentColor}>
                                        {gradilla.storagePlace}
                                    </Text>
                                </Box>
                            )}
                            
                            {gradilla.temperature && (
                                <Box 
                                    p={4} 
                                    borderRadius="md" 
                                    bg={cardBg}
                                    transition="transform 0.2s"
                                    _hover={{ transform: 'translateY(-2px)' }}
                                >
                                    <Flex align="center" mb={2}>
                                        <Box 
                                            as={FiThermometer} 
                                            color={thermometerColor}
                                            mr={2}
                                        />
                                        <Text 
                                            fontWeight="600" 
                                            color={labelColor}
                                            fontSize="sm"
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                        >
                                            Temperatura
                                        </Text>
                                    </Flex>
                                    <Text color={contentColor}>
                                        {gradilla.temperature}
                                    </Text>
                                </Box>
                            )}
                        </Grid>
                    </Box>
                </Box>

                <GrillaVisualization
                    id={params.id}
                    rows={gradilla.rows}
                    columns={gradilla.columns}
                    fields={gradilla.fields}
                    tubes={gradilla.tubes}
                    onTubeAdd={handleAddTube}
                    onTubeRemove={handleRemoveTube}
                />
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="center"
                    align="center"
                    gap={4}
                    wrap="wrap"
                >
                    <Button
                        colorScheme="red"
                        onClick={handleDeleteGrilla}
                        isLoading={isDeleting}
                        loadingText="Deleting"
                        spinner={<Spinner />}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Delete Grid
                    </Button>
                    <Button
                        colorScheme="orange"
                        onClick={handleEmptyGradilla}
                        isLoading={isEmptying}
                        loadingText="Emptying"
                        spinner={<Spinner />}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Empty Grid
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={onOpen}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Tubes Table
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Back to Dashboard
                    </Button>
                </Flex>
            </VStack>

            {/* Modal with tubes table */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent maxWidth="90vw">
                    <ModalHeader color={modalHeaderColor}>Tubes Table</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <InputGroup>
                                    <InputLeftElement pointerEvents='none'>
                                        <SearchIcon color={searchIconColor} />
                                    </InputLeftElement>
                                    <Input
                                        placeholder='Search in all fields...'
                                        color={inputTextColor}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        mb={4}
                                    />
                                </InputGroup>
                            </Box>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th color={tableHeaderColor}>Position</Th>
                                            {gradilla.fields.map(field => (
                                                <Th color={tableHeaderColor} key={field}>{field}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredTubes.map(tube => (
                                            <Tr key={tube.id}>
                                                <Td color={tableCellColor}>{tube.position}</Td>
                                                {gradilla.fields.map(field => (
                                                    <Td key={field} color={tableCellColor}>
                                                        {(tube.data && tube.data[field]) || '-'}
                                                    </Td>
                                                ))}
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                                {filteredTubes.length === 0 && (
                                    <Text textAlign="center" py={4} color={noResultsColor}>
                                        No tubes found matching the search
                                    </Text>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}
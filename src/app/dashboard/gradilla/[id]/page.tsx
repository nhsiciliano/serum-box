"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Box, Text, Button, VStack, Flex, useToast, Spinner, Table, Thead, Tbody, Tr, Th, Td, Container,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
    InputGroup,
    InputLeftElement,
    Input,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import GrillaVisualization from '@/components/GrillaVisualization';

interface Tube {
    id: string;
    position: string;
    data: Record<string, string>;
}

interface Gradilla {
    id: string;
    name: string;
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

    useEffect(() => {
        const fetchGradilla = async () => {
            try {
                const response = await fetch(`/api/gradillas/${params.id}`);
                if (!response.ok) throw new Error('Error al obtener la gradilla');
                const data: Gradilla = await response.json();
                setGradilla(data);
            } catch (error) {
                console.error('Error:', error);
                router.push('/dashboard');
            }
        };

        fetchGradilla();
    }, [params.id, router]);

    const handleDeleteGrilla = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/gradillas/${params.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar la gradilla');
            toast({
                title: "Gradilla eliminada",
                description: "La gradilla se ha eliminado exitosamente.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudo eliminar la gradilla. Por favor, intenta de nuevo.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setIsDeleting(false);
        }
    };

    const handleAddTube = async (tube: Omit<Tube, 'id'>) => {
        try {
            const response = await fetch(`/api/gradillas/${params.id}/tubes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tube),
            });
            if (!response.ok) throw new Error('Error al añadir el tubo');
            const newTube: Tube = await response.json();
            setGradilla(prev => prev ? { ...prev, tubes: [...prev.tubes, newTube] } : null);
            toast({
                title: "Tubo añadido",
                description: "El tubo se ha añadido exitosamente.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudo añadir el tubo. Por favor, intenta de nuevo.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRemoveTube = async (tubeId: string) => {
        try {
            const response = await fetch(`/api/gradillas/${params.id}/tubes/${tubeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar el tubo');
            setGradilla(prev => prev ? { ...prev, tubes: prev.tubes.filter(t => t.id !== tubeId) } : null);
            toast({
                title: "Tubo eliminado",
                description: "El tubo se ha eliminado exitosamente.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el tubo. Por favor, intenta de nuevo.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleEmptyGradilla = async () => {
        setIsEmptying(true);
        try {
            const response = await fetch(`/api/gradillas/${params.id}/tubes`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al vaciar la gradilla');
            setGradilla(prev => prev ? { ...prev, tubes: [] } : null);
            toast({
                title: "Gradilla vaciada",
                description: "Todos los tubos han sido eliminados de la gradilla.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "No se pudo vaciar la gradilla. Por favor, intenta de nuevo.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsEmptying(false);
        }
    };

    const filteredTubes = gradilla?.tubes.filter(tube => {
        if (searchTerm === '') return true;
        
        // Buscar en la posición
        if (tube.position.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        // Buscar en todos los campos de datos
        return Object.values(tube.data).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }) || [];

    if (!gradilla) return <Text color="gray.700">Cargando...</Text>;

    return (
        <Container maxW="container.xl" py={6}>
            <VStack spacing={6} align="stretch">
                <GrillaVisualization
                    title={gradilla.name}
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
                        loadingText="Eliminando"
                        spinner={<Spinner />}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Eliminar Gradilla
                    </Button>
                    <Button
                        colorScheme="orange"
                        onClick={handleEmptyGradilla}
                        isLoading={isEmptying}
                        loadingText="Vaciando"
                        spinner={<Spinner />}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Vaciar Gradilla
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={onOpen}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Tabla de Tubos
                    </Button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Volver al Dashboard
                    </Button>
                </Flex>
            </VStack>

            {/* Modal con la tabla de tubos */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent maxWidth="90vw">
                    <ModalHeader color="gray.700">Tabla de Tubos</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <InputGroup>
                                    <InputLeftElement pointerEvents='none'>
                                        <SearchIcon color='gray.300' />
                                    </InputLeftElement>
                                    <Input
                                        placeholder='Buscar en todos los campos...'
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
                                            <Th color="blue.700">Posición</Th>
                                            {gradilla.fields.map(field => (
                                                <Th color="blue.700" key={field}>{field}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredTubes.map(tube => (
                                            <Tr key={tube.id}>
                                                <Td color="gray.700">{tube.position}</Td>
                                                {gradilla.fields.map(field => (
                                                    <Td key={field} color="gray.700">
                                                        {tube.data[field] || '-'}
                                                    </Td>
                                                ))}
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                                {filteredTubes.length === 0 && (
                                    <Text textAlign="center" py={4} color="gray.500">
                                        No se encontraron tubos que coincidan con la búsqueda
                                    </Text>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
}
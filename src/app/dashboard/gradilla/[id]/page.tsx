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
                if (!response.ok) throw new Error('Error fetching grid');
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
            if (!response.ok) throw new Error('Error deleting grid');
            toast({
                title: "Grid deleted",
                description: "The grid has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
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
            if (!response.ok) throw new Error('Error adding tube');
            const newTube: Tube = await response.json();
            setGradilla(prev => prev ? { ...prev, tubes: [...prev.tubes, newTube] } : null);
            toast({
                title: "Tube added",
                description: "The tube has been successfully added.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not add tube. Please try again.",
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
            if (!response.ok) throw new Error('Error removing tube');
            setGradilla(prev => prev ? { ...prev, tubes: prev.tubes.filter(t => t.id !== tubeId) } : null);
            toast({
                title: "Tube removed",
                description: "The tube has been successfully removed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not remove tube. Please try again.",
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
            if (!response.ok) throw new Error('Error emptying grid');
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

    const filteredTubes = gradilla?.tubes.filter(tube => {
        if (searchTerm === '') return true;
        
        // Buscar en la posición
        if (tube.position.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        // Buscar en todos los campos de datos
        return Object.values(tube.data).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }) || [];

    if (!gradilla) return <Text color="gray.700">Loading...</Text>;

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
                    <ModalHeader color="gray.700">Tubes Table</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <InputGroup>
                                    <InputLeftElement pointerEvents='none'>
                                        <SearchIcon color='gray.300' />
                                    </InputLeftElement>
                                    <Input
                                        placeholder='Search in all fields...'
                                        color="gray.800"
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
                                            <Th color="blue.700">Position</Th>
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
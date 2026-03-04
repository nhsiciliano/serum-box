"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    VStack,
    HStack,
    IconButton,
    useToast,
    Textarea,
    Card,
    CardBody,
    CardFooter,
    SimpleGrid,
    Divider,
    Text,
    Flex,
    useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

const CreateGradillaForm = () => {
    const router = useRouter();
    const toast = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [storagePlace, setStoragePlace] = useState('');
    const [temperature, setTemperature] = useState('');
    const [rowCount, setRowCount] = useState(10);
    const [columnCount, setColumnCount] = useState(10);
    const [fields, setFields] = useState<string[]>(['Nombre']);
    const { fetchWithAuth } = useFetchWithAuth();
    const [isLoading, setIsLoading] = useState(false);
    const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
    const inputBg = useColorModeValue('gray.50', 'gray.700');
    const focusBorderColor = 'teal.400';

    const handleAddField = () => {
        if (fields.length < 5) {
            setFields([...fields, '']);
        }
    };

    const handleRemoveField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleFieldChange = (index: number, value: string) => {
        const newFields = [...fields];
        newFields[index] = value;
        setFields(newFields);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!name.trim()) {
            toast({
                title: "Error",
                description: 'El nombre de la gradilla es obligatorio.',
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }

        try {
            await fetchWithAuth('/api/gradillas', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    description,
                    storagePlace,
                    temperature,
                    rows: Array.from({ length: rowCount }, (_, i) => String.fromCharCode(65 + i)),
                    columns: Array.from({ length: columnCount }, (_, i) => i + 1),
                    fields: fields.length > 0 ? fields : ['Nombre']
                })
            });

            toast({
                title: 'Gradilla creada',
                description: 'La nueva gradilla se creó correctamente.',
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating grid:', error);
            toast({
                title: 'Error al crear la gradilla',
                description: 'Ocurrió un error inesperado. Intentá nuevamente.',
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card as="form" onSubmit={handleSubmit} borderRadius="xl" borderWidth="1px" borderColor={borderColor} transition="box-shadow 0.2s ease-in-out">
            <CardBody p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Nombre de la gradilla</FormLabel>
                        <Input bg={inputBg} focusBorderColor={focusBorderColor} value={name} placeholder="Ej: Stock principal de anticuerpos" onChange={(e) => setName(e.target.value)} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Descripción</FormLabel>
                        <Textarea
                            bg={inputBg}
                            focusBorderColor={focusBorderColor}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción del contenido o propósito de la gradilla."
                        />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                            <FormLabel>Lugar de almacenamiento</FormLabel>
                            <Input
                                bg={inputBg}
                                focusBorderColor={focusBorderColor}
                                value={storagePlace}
                                onChange={(e) => setStoragePlace(e.target.value)}
                                placeholder="Ej: Freezer del laboratorio #3, estante 2"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Temperatura de almacenamiento</FormLabel>
                            <Input
                                bg={inputBg}
                                focusBorderColor={focusBorderColor}
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                placeholder="Ej: -20°C, 4°C, temperatura ambiente"
                            />
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                            <FormLabel>Filas</FormLabel>
                            <NumberInput min={1} max={26} value={rowCount} onChange={(_, value) => setRowCount(value)}>
                                <NumberInputField bg={inputBg} />
                            </NumberInput>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Columnas</FormLabel>
                            <NumberInput min={1} max={50} value={columnCount} onChange={(_, value) => setColumnCount(value)}>
                                <NumberInputField bg={inputBg} />
                            </NumberInput>
                        </FormControl>
                    </SimpleGrid>

                    <Divider my={4} />

                    <FormControl>
                        <FormLabel>Campos personalizados de tubo</FormLabel>
                        <Text fontSize="sm" color="gray.500" mb={4}>Definí los campos de datos de cada tubo (máximo 5). &apos;Nombre&apos; se incluye por defecto.</Text>
                        <VStack spacing={4} align="stretch">
                            {fields.map((field, index) => (
                                <HStack key={index}>
                                    <Input
                                        bg={inputBg}
                                        focusBorderColor={focusBorderColor}
                                        value={field}
                                        onChange={(e) => handleFieldChange(index, e.target.value)}
                                        placeholder={`Campo ${index + 1}`}
                                    />
                                    <IconButton
                                        aria-label="Eliminar campo"
                                        icon={<DeleteIcon />}
                                        variant="ghost"
                                        onClick={() => handleRemoveField(index)}
                                    />
                                </HStack>
                            ))}
                            {fields.length < 5 && (
                                <Button leftIcon={<AddIcon />} onClick={handleAddField} variant="outline" size="sm" alignSelf="flex-start">
                                    Agregar campo
                                </Button>
                            )}
                        </VStack>
                    </FormControl>
                </VStack>
            </CardBody>
            <CardFooter borderTopWidth="1px" borderColor={borderColor} p={{ base: 4, md: 6 }}>
                <Flex justify="flex-end" width="100%">
                    <Button
                        type="submit"
                        colorScheme="teal"
                        isLoading={isLoading}
                        loadingText="Creando..."
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Crear gradilla
                    </Button>
                </Flex>
            </CardFooter>
        </Card>
    );
};

export default CreateGradillaForm;

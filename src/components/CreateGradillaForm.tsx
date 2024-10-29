"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, VStack, HStack, IconButton, useToast, Spinner } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';

const CreateGradillaForm = () => {
    const router = useRouter();
    const toast = useToast();
    const [name, setName] = useState('');
    const [rowCount, setRowCount] = useState(1);
    const [columnCount, setColumnCount] = useState(1);
    const [fields, setFields] = useState<string[]>([]);
    const { restrictions, canCreateGrid } = usePlanRestrictions();

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

        const currentGrillas = await fetchCurrentGrillasCount();
        if (!canCreateGrid(currentGrillas)) {
            toast({
                title: "Límite de gradillas alcanzado",
                description: `Tu plan actual permite un máximo de ${restrictions.maxGrids} gradillas. Considera actualizar tu plan para crear más.`,
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch('/api/gradillas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    rowCount,
                    columnCount,
                    fields,
                }),
            });

            if (!response.ok) throw new Error('Error al crear la gradilla');

            toast({
                title: "Gradilla creada",
                description: "La gradilla se ha creado exitosamente.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error al crear la gradilla:', error);
            toast({
                title: "Error",
                description: "No se pudo crear la gradilla. Por favor, intenta de nuevo.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const fetchCurrentGrillasCount = async () => {
        try {
            const response = await fetch('/api/user-stats');
            if (response.ok) {
                const data = await response.json();
                return data.gridCount;
            }
            return 0;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return 0;
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel color="gray.500">Nombre de la Gradilla</FormLabel>
                    <Input value={name} color="gray.500" onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color="gray.500">Número de Filas (A-Z)</FormLabel>
                    <NumberInput min={1} max={26} color="gray.500" value={rowCount} onChange={(_, value) => setRowCount(value)}>
                        <NumberInputField />
                    </NumberInput>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color="gray.500">Número de Columnas (1-50)</FormLabel>
                    <NumberInput min={1} max={50} color="gray.500" value={columnCount} onChange={(_, value) => setColumnCount(value)}>
                        <NumberInputField />
                    </NumberInput>
                </FormControl>
                <FormControl>
                    <FormLabel color="gray.500">Campos personalizados para tubos (máximo 5)</FormLabel>
                    {fields.map((field, index) => (
                        <HStack key={index} mt={2}>
                            <Input
                                value={field}
                                color="gray.500"
                                onChange={(e) => handleFieldChange(index, e.target.value)}
                                placeholder={`Campo ${index + 1}`}
                            />
                            <IconButton
                                aria-label="Eliminar campo"
                                icon={<DeleteIcon />}
                                onClick={() => handleRemoveField(index)}
                            />
                        </HStack>
                    ))}
                    {fields.length < 5 && (
                        <Button leftIcon={<AddIcon />} onClick={handleAddField} mt={2}>
                            Agregar campo
                        </Button>
                    )}
                </FormControl>
                <Button 
                    type="submit" 
                    colorScheme="teal" 
                    isLoading={false}
                    loadingText="Creando Gradilla"
                    spinner={<Spinner />}
                >
                    Crear Gradilla
                </Button>
            </VStack>
        </Box>
    );
};

export default CreateGradillaForm;

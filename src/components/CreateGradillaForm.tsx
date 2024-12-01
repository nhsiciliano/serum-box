"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, VStack, HStack, IconButton, useToast, Spinner, Textarea } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
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
    const [fields, setFields] = useState<string[]>(["Name"]);
    const { restrictions, canCreateGrid } = usePlanRestrictions();
    const { fetchWithAuth } = useFetchWithAuth();
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchCurrentGrillasCount = async () => {
        try {
            const data = await fetchWithAuth('/api/user-stats');
            return data.gridCount;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return 0;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Grid name is required",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }

        const currentGrillas = await fetchCurrentGrillasCount();
        if (!canCreateGrid(currentGrillas)) {
            toast({
                title: "Grid limit reached",
                description: `Your current plan allows a maximum of ${restrictions.maxGrids} grids. Consider upgrading your plan to create more.`,
                status: "warning",
                duration: 5000,
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
                    fields: fields.length > 0 ? fields : ['Name']
                })
            });

            toast({
                title: "Grid created",
                description: "The grid has been created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating grid:', error);
            toast({
                title: "Error",
                description: "Could not create grid. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel color="gray.500">Grid Name</FormLabel>
                    <Input value={name} placeholder="Enter a name for your grid..." color="gray.500" onChange={(e) => setName(e.target.value)} />
                </FormControl>

                <FormControl>
                    <FormLabel color="gray.500">Grid Description</FormLabel>
                    <Textarea 
                        value={description} 
                        color="gray.500" 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a description for your grid..."
                    />
                </FormControl>

                <FormControl>
                    <FormLabel color="gray.500">Storage Place</FormLabel>
                    <Input 
                        value={storagePlace} 
                        color="gray.500" 
                        onChange={(e) => setStoragePlace(e.target.value)}
                        placeholder="e.g., Lab Room 101, Freezer #3"
                    />
                </FormControl>

                <FormControl>
                    <FormLabel color="gray.500">Storage Temperature</FormLabel>
                    <Input 
                        value={temperature} 
                        color="gray.500" 
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="e.g., -20°C, 4°C"
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel color="gray.500">Number of Rows (A-Z)</FormLabel>
                    <NumberInput min={1} max={26} color="gray.500" value={rowCount} onChange={(_, value) => setRowCount(value)}>
                        <NumberInputField />
                    </NumberInput>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color="gray.500">Number of Columns (1-50)</FormLabel>
                    <NumberInput min={1} max={50} color="gray.500" value={columnCount} onChange={(_, value) => setColumnCount(value)}>
                        <NumberInputField />
                    </NumberInput>
                </FormControl>
                <FormControl>
                    <FormLabel color="gray.500">Custom fields for tubes (maximum 5)</FormLabel>
                    {fields.map((field, index) => (
                        <HStack key={index} mt={2}>
                            <Input
                                value={field}
                                color="gray.500"
                                onChange={(e) => handleFieldChange(index, e.target.value)}
                                placeholder={`Field ${index + 1}`}
                            />
                            <IconButton
                                aria-label="Delete field"
                                icon={<DeleteIcon />}
                                onClick={() => handleRemoveField(index)}
                            />
                        </HStack>
                    ))}
                    {fields.length < 5 && (
                        <Button leftIcon={<AddIcon />} onClick={handleAddField} mt={2}>
                            Add field
                        </Button>
                    )}
                </FormControl>
                <Button 
                    type="submit" 
                    colorScheme="teal" 
                    isLoading={isLoading}
                    loadingText="Creating Grid"
                    spinner={<Spinner />}
                >
                    Create Grid
                </Button>
            </VStack>
        </Box>
    );
};

export default CreateGradillaForm;

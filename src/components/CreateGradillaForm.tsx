"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, VStack, HStack, IconButton, useToast, Spinner, Textarea } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';

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

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Grid name is required",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
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
            return;
        }

        const rows = Array.from({ length: rowCount }, (_, i) => 
            String.fromCharCode(65 + i)
        );
        
        const columns = Array.from({ length: columnCount }, (_, i) => i + 1);

        try {
            const response = await fetch('/api/gradillas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                    storagePlace,
                    temperature,
                    rows,
                    columns,
                    fields: fields.length > 0 ? fields : ['Name']
                }),
            });

            if (!response.ok) throw new Error('Error creating grid');

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
            console.error('Error fetching statistics:', error);
            return 0;
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel color="gray.500">Grid Name</FormLabel>
                    <Input value={name} color="gray.500" onChange={(e) => setName(e.target.value)} />
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
                    isLoading={false}
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

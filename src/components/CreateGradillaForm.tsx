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
    Flex
} from '@chakra-ui/react';
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
                description: "Grid name is required.",
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
                title: "Grid Created",
                description: "The new grid has been created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Error creating grid:', error);
            toast({
                title: "Error Creating Grid",
                description: "An unexpected error occurred. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card as="form" onSubmit={handleSubmit} borderRadius="lg" borderWidth="1px" borderColor="gray.200" _hover={{ boxShadow: 'lg' }} transition="box-shadow 0.2s ease-in-out">
            <CardBody p={{ base: 4, md: 6 }}>
                <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Grid Name</FormLabel>
                        <Input value={name} placeholder="e.g., Main Antibody Stock" onChange={(e) => setName(e.target.value)} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A brief description of the grid's contents or purpose."
                        />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                            <FormLabel>Storage Place</FormLabel>
                            <Input
                                value={storagePlace}
                                onChange={(e) => setStoragePlace(e.target.value)}
                                placeholder="e.g., Lab Freezer #3, Shelf 2"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Storage Temperature</FormLabel>
                            <Input
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                placeholder="e.g., -20°C, 4°C, Room Temp"
                            />
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                            <FormLabel>Rows</FormLabel>
                            <NumberInput min={1} max={26} value={rowCount} onChange={(_, value) => setRowCount(value)}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Columns</FormLabel>
                            <NumberInput min={1} max={50} value={columnCount} onChange={(_, value) => setColumnCount(value)}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                    </SimpleGrid>

                    <Divider my={4} />

                    <FormControl>
                        <FormLabel>Custom Tube Fields</FormLabel>
                        <Text fontSize="sm" color="gray.500" mb={4}>Define the data fields for each tube in the grid (max 5). &apos;Name&apos; is included by default.</Text>
                        <VStack spacing={4} align="stretch">
                            {fields.map((field, index) => (
                                <HStack key={index}>
                                    <Input
                                        value={field}
                                        onChange={(e) => handleFieldChange(index, e.target.value)}
                                        placeholder={`Field ${index + 1}`}
                                    />
                                    <IconButton
                                        aria-label="Delete field"
                                        icon={<DeleteIcon />}
                                        variant="ghost"
                                        onClick={() => handleRemoveField(index)}
                                    />
                                </HStack>
                            ))}
                            {fields.length < 5 && (
                                <Button leftIcon={<AddIcon />} onClick={handleAddField} variant="outline" size="sm" align-self="flex-start">
                                    Add Field
                                </Button>
                            )}
                        </VStack>
                    </FormControl>
                </VStack>
            </CardBody>
            <CardFooter borderTopWidth="1px" borderColor="gray.200" p={{ base: 4, md: 6 }}>
                <Flex justify="flex-end" width="100%">
                    <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={isLoading}
                        loadingText="Creating..."
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Create Grid
                    </Button>
                </Flex>
            </CardFooter>
        </Card>
    );
};

export default CreateGradillaForm;

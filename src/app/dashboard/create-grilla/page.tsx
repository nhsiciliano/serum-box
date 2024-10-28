"use client"

import { Box, Heading } from '@chakra-ui/react';
import CreateGradillaForm from '@/components/CreateGradillaForm';

export default function CreateGrillaPage() {
    return (
        <Box>
            <Heading as="h2" color="gray.500" size="xl" mb={6}>Crear Nueva Gradilla</Heading>
            <CreateGradillaForm />
        </Box>
    );
}

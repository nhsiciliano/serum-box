"use client"

import { Box, Heading, VStack } from '@chakra-ui/react';
import CreateGradillaForm from '@/components/CreateGradillaForm';

export default function CreateGrillaPage() {
    return (
        <Box p={{ base: 4, md: 8 }} display="flex" justifyContent="center">
            <VStack spacing={8} align="stretch" width="100%" maxWidth="800px">
                <Heading as="h1" size="xl" color="brand.700">
                    Create a New Grid
                </Heading>
                <CreateGradillaForm />
            </VStack>
        </Box>
    );
}

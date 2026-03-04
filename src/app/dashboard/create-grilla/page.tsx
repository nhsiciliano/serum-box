"use client"

import { Box, VStack } from '@chakra-ui/react';
import CreateGradillaForm from '@/components/CreateGradillaForm';
import { DashboardSection } from '@/components/ResponsiveContainers';

export default function CreateGrillaPage() {
    return (
        <Box>
            <DashboardSection
                title="Crear una nueva gradilla"
                subtitle="Definí estructura, metadatos de almacenamiento y campos personalizados en un solo flujo."
                fullWidth
            >
                <VStack spacing={8} align="stretch" width="100%" maxWidth="900px">
                    <CreateGradillaForm />
                </VStack>
            </DashboardSection>
        </Box>
    );
}

'use client'

import { Box, Container, Heading } from '@chakra-ui/react';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { DashboardSection } from '@/components/ResponsiveContainers';

export default function AuditLogPage() {
    return (
        <Container maxW="container.xl" px={0}>
            <DashboardSection
                title="Registros de auditoría"
                subtitle="Revisá acciones de usuarios, cambios de entidades y eventos de trazabilidad."
                fullWidth
            >
                <Box mb={4}>
                    <Heading size="sm" color="gray.500">Línea de cumplimiento</Heading>
                </Box>
                <AuditLogViewer />
            </DashboardSection>
        </Container>
    );
}

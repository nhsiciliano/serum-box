'use client'

import { Box, Container, Heading } from '@chakra-ui/react';
import { AuditLogViewer } from '@/components/AuditLogViewer';

export default function AuditLogPage() {
    return (
        <Container maxW="container.xl">
            <Box mb={8}>
                <Heading size="lg" color="gray.600">Audit Logs</Heading>
            </Box>
            <AuditLogViewer />
        </Container>
    );
}
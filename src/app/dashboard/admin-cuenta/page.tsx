'use client';

import {
    Box,
    Container,
    VStack,
    Heading,
    Text,
    useColorModeValue,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    Badge,
    Divider,
    HStack,
} from '@chakra-ui/react';
import type { ElementType } from 'react';
import { useSession } from 'next-auth/react';
import { FiMail, FiUser, FiUsers } from 'react-icons/fi';

interface InfoRowProps {
    label: string;
    value: string;
    icon?: ElementType;
}

function InfoRow({ label, value, icon: Icon }: InfoRowProps) {
    const labelColor = useColorModeValue('gray.600', 'gray.400');
    const valueColor = useColorModeValue('gray.800', 'white');

    return (
        <HStack justify="space-between" align="center" py={2} spacing={3}>
            <HStack spacing={2}>
                {Icon ? <Box as={Icon} color="brand.500" /> : null}
                <Text color={labelColor} fontSize="sm">{label}</Text>
            </HStack>
            <Text color={valueColor} fontWeight="medium" textAlign="right">{value}</Text>
        </HStack>
    );
}

export default function AdminCuenta() {
    const { data: session } = useSession();

    const pageBg = useColorModeValue('transparent', 'transparent');
    const headingColor = useColorModeValue('gray.700', 'gray.200');
    const mutedColor = useColorModeValue('gray.600', 'gray.400');
    const cardBg = useColorModeValue('white', 'gray.700');

    const userName = session?.user?.name || 'Usuario';
    const userEmail = session?.user?.email || 'Sin correo';
    const emailVerified = session?.user?.emailVerified ? 'Verificado' : 'Pendiente de verificación';
    const accountType = session?.user?.isMainUser ? 'Cuenta principal' : 'Cuenta secundaria';

    return (
        <Box bg={pageBg} py={{ base: 2, md: 4 }}>
            <Container maxW="container.lg">
                <VStack spacing={8} align="stretch">
                    <VStack spacing={2} textAlign="center">
                        <Heading as="h1" size="xl" color={headingColor}>
                            Configuración de cuenta
                        </Heading>
                        <Text color={mutedColor}>
                            Gestioná los datos de tu cuenta y la información de acceso.
                        </Text>
                    </VStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                            <CardHeader pb={2}>
                                <Heading size="md" color={headingColor}>Perfil</Heading>
                            </CardHeader>
                            <CardBody>
                                <InfoRow label="Nombre" value={userName} icon={FiUser} />
                                <Divider />
                                <InfoRow label="Correo" value={userEmail} icon={FiMail} />
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                            <CardHeader pb={2}>
                                <Heading size="md" color={headingColor}>Acceso</Heading>
                            </CardHeader>
                            <CardBody>
                                <InfoRow label="Rol" value={accountType} icon={FiUsers} />
                                <Divider />
                                <HStack justify="space-between" align="center" py={2}>
                                    <Text color={mutedColor} fontSize="sm">Estado del correo</Text>
                                    <Badge colorScheme={session?.user?.emailVerified ? 'green' : 'orange'}>
                                        {emailVerified}
                                    </Badge>
                                </HStack>
                            </CardBody>
                        </Card>
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
}

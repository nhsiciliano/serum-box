'use client'

import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
    const router = useRouter();

    return (
        <Box maxWidth="full" margin="auto" backgroundColor={'gray.500'} padding={8} textAlign="center">
            <Heading as="h1" mb={6}>¡Pago exitoso!</Heading>
            <Text fontSize="xl" mb={6}>
                Gracias por tu suscripción. Tu plan ha sido actualizado correctamente.
            </Text>
            <Button colorScheme="blue" onClick={() => router.push('/dashboard/admin-cuenta')}>
                Volver a mi cuenta
            </Button>
        </Box>
    );
}


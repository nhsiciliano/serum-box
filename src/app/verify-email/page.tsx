"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, useToast } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, verificationCode }),
            });
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: "Cuenta verificada",
                    description: "Tu cuenta ha sido verificada exitosamente",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                router.push('/dashboard');
            } else {
                throw new Error(data.message || 'Error al verificar el correo electrónico');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al verificar el correo electrónico';
            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box maxWidth="400px" margin="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
            <VStack spacing={6} align="stretch">
                <Text fontSize="xl" fontWeight="bold" color="teal.500" textAlign="center">
                    Verifica tu correo electrónico
                </Text>
                <Text color="gray.600" textAlign="center">
                    Se ha enviado un código de verificación a {email}. Por favor, ingresa el código a continuación.
                </Text>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel color="gray.600">Código de verificación</FormLabel>
                            <Input type="text" color="gray.600" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                        </FormControl>
                        <Button type="submit" colorScheme="teal" width="full" isLoading={isLoading}>Verificar</Button>
                    </VStack>
                </form>
            </VStack>
        </Box>
    );
}

"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Image, useColorModeValue, Link, useToast } from '@chakra-ui/react';

export default function RecoverPassword({ onBackToLogin }: { onBackToLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/recover-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Recovery email sent",
                    description: "Please check your email for password reset instructions.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
                onBackToLogin();
            } else {
                throw new Error(data.message || 'Error sending recovery email');
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not send recovery email. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');

    return (
        <Box maxWidth="400px" margin="auto" p={6} bg={bgColor} borderRadius="md" boxShadow="lg">
            <VStack spacing={6} align="stretch">
                <Image
                    src="/images/serum-box.png"
                    alt="Serum Box Logo"
                    width="200px"
                    height="auto"
                    margin="auto"
                />
                <Text fontSize="xl" fontWeight="bold" textAlign="center" color={textColor}>
                    Recover Password
                </Text>
                <Text textAlign="center" color="gray.500" fontSize="sm">
                    Enter your email address and we&apos;ll send you instructions to reset your password.
                </Text>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel color="black">Email</FormLabel>
                            <Input
                                type="email"
                                textColor="gray.800"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            colorScheme="teal"
                            width="full"
                            isLoading={isLoading}
                            loadingText="Sending"
                        >
                            Send Recovery Email
                        </Button>
                    </VStack>
                </form>
                <Text textAlign="center" color="gray.500" fontSize="sm">
                    Remember your password? <Link color="teal.500" onClick={onBackToLogin}>Back to Login</Link>
                </Text>
            </VStack>
        </Box>
    );
} 
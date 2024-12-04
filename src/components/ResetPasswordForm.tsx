"use client"

import { useState, Suspense } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Image, useColorModeValue, useToast, Center, Spinner } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Componente interno con la lógica del formulario
const ResetPasswordContent = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validatePassword(password)) {
            toast({
                title: "Invalid password",
                description: "Password must be at least 8 characters long and include uppercase, lowercase, numbers and special characters.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please ensure both passwords are the same.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Password reset successful",
                    description: "Your password has been updated. Please log in with your new password.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
                router.push('/login');
            } else {
                throw new Error(data.error || 'Error resetting password');
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Could not reset password. The link might be expired or invalid.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                    Reset Your Password
                </Text>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel color="black">New Password</FormLabel>
                            <Input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                textColor="gray.800"
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color="black">Confirm New Password</FormLabel>
                            <Input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                textColor="gray.800"
                                required
                            />
                        </FormControl>
                        <Text fontSize="sm" color="gray.500">
                            Password must be at least 8 characters long and include uppercase, 
                            lowercase, numbers and special characters.
                        </Text>
                        <Button 
                            type="submit" 
                            colorScheme="teal" 
                            width="full"
                            isLoading={isLoading}
                            loadingText="Resetting"
                        >
                            Reset Password
                        </Button>
                    </VStack>
                </form>
            </VStack>
        </Box>
    );
};

// Componente principal envuelto en Suspense
export default function ResetPasswordForm() {
    return (
        <Suspense
            fallback={
                <Center py={8}>
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                    />
                </Center>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
} 
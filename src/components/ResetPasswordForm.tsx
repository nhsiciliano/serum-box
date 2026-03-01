"use client"

import { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, useColorModeValue, useToast, Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import type { Session } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [canReset, setCanReset] = useState(false);
    const toast = useToast();
    const router = useRouter();
    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const initializeRecoverySession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error validating recovery session:', error);
            }

            setCanReset(Boolean(data.session));
            setIsCheckingSession(false);
        };

        initializeRecoverySession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            setCanReset(Boolean(session));
            setIsCheckingSession(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

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
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (!error) {
                toast({
                    title: "Password reset successful",
                    description: "Your password has been updated. Please log in with your new password.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
                await supabase.auth.signOut();
                router.push('/login');
            } else {
                throw new Error(error.message || 'Error resetting password');
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

    if (isCheckingSession) {
        return (
            <Center py={8}>
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                />
            </Center>
        );
    }

    if (!canReset) {
        return (
            <Box maxWidth="400px" margin="auto" p={6} bg={bgColor} borderRadius="md" boxShadow="lg">
                <VStack spacing={4} align="stretch">
                    <Text fontSize="xl" fontWeight="bold" textAlign="center" color={textColor}>
                        Recovery link required
                    </Text>
                    <Text textAlign="center" color="gray.500" fontSize="sm">
                        Open the password recovery link sent to your email to set a new password.
                    </Text>
                    <Button colorScheme="teal" onClick={() => router.push('/login')}>
                        Back to Login
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box maxWidth="400px" margin="auto" p={6} bg={bgColor} borderRadius="md" boxShadow="lg">
            <VStack spacing={6} align="stretch">
                <Box position="relative" width="200px" height="56px" mx="auto">
                    <NextImage
                        src="/images/serum-box.png"
                        alt="Serum Box Logo"
                        fill
                        sizes="200px"
                        priority
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
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
}

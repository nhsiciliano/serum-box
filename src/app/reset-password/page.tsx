"use client"

import { Box, Flex } from '@chakra-ui/react';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import NextImage from 'next/image';

export default function ResetPasswordPage() {
    return (
        <Flex width="100%" height="100vh">
            <Box width={{ base: "100%", md: "50%" }} margin="auto" p={8}>
                <Box maxWidth="400px" m="auto">
                    <ResetPasswordForm />
                </Box>
            </Box>
            <Box 
                width={{ base: "0%", md: "50%" }} 
                height="100%" 
                position="relative"
                display={{ base: "none", md: "block" }}
            >
                <NextImage
                    src="/login-image.jpg"
                    alt="Login background"
                    fill
                    sizes="50vw"
                    priority
                    style={{ objectFit: 'cover' }}
                />
            </Box>
        </Flex>
    );
} 

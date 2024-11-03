'use client'

import { Box, Heading, Text, Button, Container } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
    const router = useRouter();

    return (
        <Container maxW="container.xl" py={8}>
            <Box 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="sm" 
                textAlign="center"
            >
                <Heading as="h1" mb={6} color="green.500">Payment Successful!</Heading>
                <Text fontSize="xl" mb={6} color="gray.700">
                    Thank you for your subscription. Your plan has been successfully updated.
                </Text>
                <Button 
                    colorScheme="blue" 
                    onClick={() => router.push('/dashboard/admin-cuenta')}
                >
                    Back to My Account
                </Button>
            </Box>
        </Container>
    );
}


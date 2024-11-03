'use client'

import { Box, Heading, Text, Button, Container } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function CancelPage() {
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
                <Heading as="h1" mb={6} color="red.500">Payment Cancelled</Heading>
                <Text fontSize="xl" mb={6} color="gray.700">
                    Your payment has been cancelled. No charges have been made.
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


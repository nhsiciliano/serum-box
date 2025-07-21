'use client';

import { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    useToast,
    useColorModeValue,
    Tag,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

const QUICK_QUERIES = [
    'How do I create a new grid?',
    'What do the different stock statuses mean?',
    'How can I edit a reagent?',
    'I have a billing question.',
    'I found a bug.',
];

export const EmailSupport = () => {
    const { data: session } = useSession();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const cardBg = useColorModeValue('white', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const tagHoverBg = useColorModeValue('brand.100', 'brand.600');

    const handleQuickQueryClick = (query: string) => {
        setSubject(query);
        setMessage(`Regarding: ${query}\n\n`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in both subject and message.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name: session?.user?.name || 'User',
                    email: session?.user?.email,
                    message: `Subject: ${subject}\n\n${message}`
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            toast({
                title: 'Message Sent!',
                description: "We've received your query and will get back to you shortly.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            setSubject('');
            setMessage('');
        } catch (e) {
            console.error('Failed to send support email:', e);
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again later.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={6} bg={cardBg} borderRadius="lg" boxShadow="md" w="100%">
            <Text mb={6} color={textColor} fontSize="lg">
                Have a question or need help? Send us a message.
            </Text>

            <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                    <Box>
                        <Text mb={2} fontSize="sm" fontWeight="medium" color={textColor}>
                            Quick Queries
                        </Text>
                        <Wrap spacing={2}>
                            {QUICK_QUERIES.map((query) => (
                                <WrapItem key={query}>
                                    <Tag 
                                        as="button"
                                        type="button"
                                        onClick={() => handleQuickQueryClick(query)}
                                        variant="subtle"
                                        colorScheme="brand"
                                        cursor="pointer"
                                        _hover={{ bg: tagHoverBg }}
                                    >
                                        {query}
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>

                    <FormControl isRequired>
                        <FormLabel htmlFor="subject" color={headingColor}>Subject</FormLabel>
                        <Input 
                            id="subject" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            placeholder="How can we help?"
                            color={textColor}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor="message" color={headingColor}>Message</FormLabel>
                        <Textarea 
                            id="message" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder="Describe your issue or question in detail..."
                            rows={6}
                            color={textColor}
                        />
                    </FormControl>

                    <Button 
                        type="submit" 
                        colorScheme="brand" 
                        isLoading={isLoading}
                        alignSelf="flex-start"
                    >
                        Send Message
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

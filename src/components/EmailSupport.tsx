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
    '¿Cómo creo una nueva gradilla?',
    '¿Qué significa cada estado del stock?',
    '¿Cómo edito un reactivo?',
    'Tengo una consulta sobre acceso a la cuenta.',
    'Encontré un error en la app.',
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
        setMessage(`Consulta sobre: ${query}\n\n`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast({
                title: 'Missing fields',
                description: 'Completá el asunto y el mensaje.',
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
                title: '¡Mensaje enviado!',
                description: 'Recibimos tu consulta y te vamos a responder a la brevedad.',
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
                description: 'Algo salió mal. Intentá nuevamente más tarde.',
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
                ¿Tenés una consulta o necesitás ayuda? Escribinos.
            </Text>

            <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                    <Box>
                        <Text mb={2} fontSize="sm" fontWeight="medium" color={textColor}>
                            Consultas rápidas
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
                        <FormLabel htmlFor="subject" color={headingColor}>Asunto</FormLabel>
                        <Input 
                            id="subject" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            placeholder="¿Cómo te podemos ayudar?"
                            color={textColor}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor="message" color={headingColor}>Mensaje</FormLabel>
                        <Textarea 
                            id="message" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder="Describí tu consulta o problema en detalle..."
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
                        Enviar mensaje
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

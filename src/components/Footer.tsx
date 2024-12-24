"use client";

import {
    Box,
    Text,
    useColorModeValue,
    VStack,
    HStack,
    Input,
    Textarea,
    Button,
    Heading,
    Container,
    SimpleGrid,
    useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function Footer() {
    const { language } = useLanguage();
    const t = translations[language];
    const toast = useToast();

    const bgColor = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const headingColor = useColorModeValue("green.600", "green.300");
    const inputBgColor = useColorModeValue("white", "gray.700");
    const inputColor = useColorModeValue("gray.800", "gray.100");
    const borderColor = useColorModeValue("green.500", "green.300");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: t.footer.contact.successTitle || "Message Sent",
                    description: t.footer.contact.successMessage || "Your message has been sent successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                
                // Reiniciar los campos
                setName("");
                setEmail("");
                setMessage("");
            } else {
                throw new Error(result.error || "Failed to send message");
            }
        } catch (error) {
            toast({
                title: t.footer.contact.errorTitle || "Error",
                description: t.footer.contact.errorMessage || "Failed to send message. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Contact form error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box bg={bgColor} color={textColor} py={12}>
            <Container maxW="container.xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h3" size="lg" color={headingColor}>
                            {t.footer.contact.title}
                        </Heading>
                        <Text>
                            {t.footer.contact.description}
                        </Text>
                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <VStack spacing={4} align="stretch">
                                <Input
                                    placeholder={t.footer.contact.name}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    bg={inputBgColor}
                                    color={inputColor}
                                    borderColor={borderColor}
                                    _hover={{ borderColor: headingColor }}
                                    _focus={{
                                        borderColor: headingColor,
                                        boxShadow: `0 0 0 1px ${headingColor}`,
                                    }}
                                    required
                                />
                                <Input
                                    placeholder={t.footer.contact.email}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    bg={inputBgColor}
                                    color={inputColor}
                                    borderColor={borderColor}
                                    _hover={{ borderColor: headingColor }}
                                    _focus={{
                                        borderColor: headingColor,
                                        boxShadow: `0 0 0 1px ${headingColor}`,
                                    }}
                                    required
                                />
                                <Textarea
                                    placeholder={t.footer.contact.message}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    bg={inputBgColor}
                                    color={inputColor}
                                    borderColor={borderColor}
                                    _hover={{ borderColor: headingColor }}
                                    _focus={{
                                        borderColor: headingColor,
                                        boxShadow: `0 0 0 1px ${headingColor}`,
                                    }}
                                    required
                                />
                                <Button
                                    type="submit"
                                    colorScheme="green"
                                    bg={headingColor}
                                    isLoading={isSubmitting}
                                    _hover={{ bg: useColorModeValue("green.700", "green.400") }}
                                >
                                    {t.footer.contact.send}
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h3" size="lg" color={headingColor}>
                            {t.footer.about.title}
                        </Heading>
                        <Text>
                            {t.footer.about.description}
                        </Text>
                        <HStack spacing={4}>
                            {/* Aquí puedes agregar iconos de redes sociales si lo deseas */}
                        </HStack>
                    </VStack>
                </SimpleGrid>
                <Box
                    borderTopWidth={1}
                    borderTopColor={borderColor}
                    mt={12}
                    pt={8}
                    textAlign="center"
                >
                    <Text>
                        &copy; {new Date().getFullYear()} Serum Box. {t.footer.about.rights}
                    </Text>
                </Box>
            </Container>
        </Box>
    );
}

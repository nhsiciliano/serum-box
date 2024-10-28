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
} from "@chakra-ui/react";
import { useState } from "react";

export default function Footer() {
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const headingColor = useColorModeValue("green.600", "green.300");
    const inputBgColor = useColorModeValue("white", "gray.700");
    const inputColor = useColorModeValue("gray.800", "gray.100");
    const borderColor = useColorModeValue("green.500", "green.300");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí puedes agregar la lógica para enviar el formulario
        console.log("Formulario enviado:", { name, email, message });
        // Reiniciar los campos después del envío
        setName("");
        setEmail("");
        setMessage("");
    };

    return (
        <Box bg={bgColor} color={textColor} py={12}>
            <Container maxW="container.xl">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h3" size="lg" color={headingColor}>
                            Contáctanos
                        </Heading>
                        <Text>
                            Ante cualquier duda envíanos un mensaje y nos pondremos en
                            contacto contigo.
                        </Text>
                        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                            <VStack spacing={4} align="stretch">
                                <Input
                                    placeholder="Nombre"
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
                                    placeholder="Email"
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
                                    placeholder="Tu consulta"
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
                                    _hover={{ bg: useColorModeValue("green.700", "green.400") }}
                                >
                                    Enviar mensaje
                                </Button>
                            </VStack>
                        </form>
                    </VStack>
                    <VStack align="flex-start" spacing={4}>
                        <Heading as="h3" size="lg" color={headingColor}>
                            Serum Box
                        </Heading>
                        <Text>
                            Gestiona tus muestras de suero de manera eficiente y segura con
                            Serum Box.
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
                        &copy; {new Date().getFullYear()} Serum Box. Todos los derechos
                        reservados.
                    </Text>
                </Box>
            </Container>
        </Box>
    );
}

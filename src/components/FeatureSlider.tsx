'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, HStack, Container, Image, Circle, useColorModeValue } from '@chakra-ui/react';

const features = [
    {
        title: "Gestión de Muestras de Suero",
        description: "Organiza y gestiona eficientemente tus muestras de suero humano para investigación.",
        image: "/images/gestion-muestras.jpg" // Asegúrate de tener esta imagen en tu carpeta public/images
    },
    {
        title: "Gradillas Personalizables",
        description: "Crea gradillas personalizadas con ubicaciones flexibles, como A-J y 1-10.",
        image: "/images/gradillas-personalizables.jpg"
    },
    {
        title: "Información Detallada de Muestras",
        description: "Registra datos importantes como nombre del paciente, fecha de nacimiento, fecha de muestra y número de protocolo.",
        image: "/images/informacion-detallada.jpg"
    },
    {
        title: "Búsqueda Avanzada",
        description: "Localiza rápidamente muestras específicas con nuestro sistema de búsqueda avanzada.",
        image: "/images/busqueda-avanzada.jpg"
    }
];

export default function FeatureSlider() {
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const bgColor = useColorModeValue('white', 'gray.800');
    const headingColor = useColorModeValue('gray.600', 'gray.200');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <Box bg={bgColor} py={20}>
            <Container maxW="container.xl">
                <VStack spacing={12} align="center">
                    <Heading as="h2" size="xl" color={headingColor}>Descubre el potencial de Serum Box</Heading>
                    <Box width="full">
                        <Image 
                            src={features[currentFeature].image} 
                            alt={features[currentFeature].title} 
                            borderRadius="lg" 
                            boxShadow="lg"
                            width="100%"
                            height="auto"
                            maxHeight="400px"
                            objectFit="cover"
                        />
                        <VStack align="center" spacing={4} mt={6}>
                            <Heading as="h3" color={headingColor} size="lg" textAlign="center">{features[currentFeature].title}</Heading>
                            <Text fontSize="lg" color={textColor} textAlign="center" maxWidth="800px">{features[currentFeature].description}</Text>
                        </VStack>
                    </Box>
                    <HStack spacing={4}>
                        {features.map((_, index) => (
                            <Circle
                                key={index}
                                size="12px"
                                bg={index === currentFeature ? "green.600" : "gray.300"}
                                cursor="pointer"
                                onClick={() => setCurrentFeature(index)}
                            />
                        ))}
                    </HStack>
                </VStack>
            </Container>
        </Box>
    );
}

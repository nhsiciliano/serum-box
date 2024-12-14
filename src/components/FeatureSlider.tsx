'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, Container, Image, Circle, useColorModeValue, HStack } from '@chakra-ui/react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function FeatureSlider() {
    const { language } = useLanguage();
    const t = translations[language as 'en' | 'es'];

    const features = [
        {
            title: t.features.title1,
            description: t.features.description1,
            image: "/images/gestion-muestras.jpg"
        },
        {
            title: t.features.title2,
            description: t.features.description2,
            image: "/images/gradillas-personalizables.jpg"
        },
        {
            title: t.features.title3,
            description: t.features.description3,
            image: "/images/informacion-detallada.jpg"
        },
        {
            title: t.features.title4,
            description: t.features.description4,
            image: "/images/busqueda-avanzada.jpg"
        },
        {
            title: t.features.title5,
            description: t.features.description5,
            image: "/images/stock-manager.jpg"
        },
        {
            title: t.features.title6,
            description: t.features.description6,
            image: "/images/stock-analytics.jpg"
        }
    ];

    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [features.length]);

    const bgColor = useColorModeValue('white', 'gray.800');
    const headingColor = useColorModeValue('gray.600', 'gray.200');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <Box bg={bgColor} py={20}>
            <Container maxW="container.xl">
                <VStack spacing={12} align="center">
                    <Heading as="h2" size="xl" color={headingColor}>{t.features.discover}</Heading>
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

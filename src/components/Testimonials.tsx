"use client"

import { Box, Container, Heading, Text, VStack, SimpleGrid, Avatar, HStack, useColorModeValue } from '@chakra-ui/react';

const testimonials = [
  {
    name: "Dra. María García",
    role: "Investigadora en Inmunología",
    content: "Serum Box ha transformado la forma en que gestionamos nuestras muestras de suero. La capacidad de personalizar gradillas y registrar información detallada es invaluable para nuestro laboratorio."
  },
  {
    name: "Prof. John Smith",
    role: "Director de Laboratorio Clínico",
    content: "La facilidad de uso y la potencia de Serum Box han mejorado significativamente nuestra eficiencia. Ahora podemos rastrear y gestionar miles de muestras sin esfuerzo."
  },
  {
    name: "Dra. Laura Martínez",
    role: "Coordinadora de Estudios Clínicos",
    content: "Serum Box ha sido fundamental en la organización de nuestros estudios multicéntricos. La capacidad de acceder a la información de las muestras de forma rápida y precisa ha acelerado nuestros procesos de investigación."
  }
];

export default function Testimonials() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('black', 'white');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading as="h2" color={headingColor} size="xl">Lo que dicen nuestros usuarios</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {testimonials.map((testimonial, index) => (
              <Box key={index} bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
                <VStack align="start" spacing={4}>
                  <Text fontSize="md" fontStyle="italic" color={textColor}>"{testimonial.content}"</Text>
                  <HStack>
                    <Avatar name={testimonial.name} src={`https://i.pravatar.cc/150?img=${index}`} />
                    <Box>
                      <Text fontWeight="bold" color={textColor}>{testimonial.name}</Text>
                      <Text fontSize="sm" color={textColor}>{testimonial.role}</Text>
                    </Box>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

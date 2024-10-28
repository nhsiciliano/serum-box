'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';

export default function HomeContent() {
  const bgGradient = useColorModeValue(
    'linear(to-r, teal.300, green.200)',
    'linear(to-r, teal.700, green.600)'
  );
  const textColor = useColorModeValue('gray.800', 'white');
  const buttonBg = useColorModeValue('green.600', 'green.400');
  const buttonHoverBg = useColorModeValue('green.700', 'green.500');

  return (
    <Box bgGradient={bgGradient} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} alignItems="center" textAlign="center">
          <Heading as="h1" size="3xl" color={textColor}>
            Gestiona tus muestras de suero/plasma con Serum Box
          </Heading>
          <Text
            fontSize="2xl"
            color="white"
            bg="blue.600"
            p={4}
            borderRadius="md"
          >
            Organiza, almacena y analiza tus muestras de suero de manera eficiente
          </Text>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Comienza tu prueba gratuita y prueba todas las funcionalidades para mejorar la administración de tus muestras.
          </Text>
          <Link href="/login" passHref legacyBehavior>
            <Button
              bg={buttonBg}
              as="a"
              color="white"
              px={8}
              py={4}
              rounded="full"
              _hover={{ bg: buttonHoverBg }}
              target="_blank"
              rel="noopener noreferrer" 
              size="lg"
            >
              Comenzar prueba
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}

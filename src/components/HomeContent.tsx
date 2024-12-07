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
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function HomeContent() {
  const { language } = useLanguage();
  const t = translations[language as 'en' | 'es'];
  
  const bgGradient = useColorModeValue(
    'linear(to-r, teal.300, green.200)',
    'linear(to-r, teal.700, green.600)'
  );
  const textColor = useColorModeValue('gray.800', 'white');
  const buttonBg = useColorModeValue('green.600', 'green.400');
  const buttonHoverBg = useColorModeValue('green.700', 'green.500');

  return (
    <Box bgGradient={bgGradient} py={28}>
      <Container maxW="container.xl">
        <VStack spacing={8} alignItems="center" textAlign="center">
          <Heading as="h1" size="3xl" color={textColor}>
            {t.home.title}
          </Heading>
          <Text
            fontSize="2xl"
            color="white"
            bg="blue.600"
            p={4}
            borderRadius="md"
          >
            {t.home.subtitle}
          </Text>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            {t.home.description}
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
              {t.home.startTrial}
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}

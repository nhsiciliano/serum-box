"use client"

import { Box, Container, Heading, Text, VStack, SimpleGrid, Avatar, HStack, useColorModeValue } from '@chakra-ui/react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function Testimonials() {
  const { language } = useLanguage();
  const t = translations[language as 'en' | 'es'];

  const bgColor = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('black', 'white');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading as="h2" color={headingColor} size="xl">
            {t.testimonials.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {t.testimonials.testimonials.map((testimonial, index) => (
              <Box key={index} bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
                <VStack align="start" spacing={4}>
                  <Text fontSize="md" fontStyle="italic" color={textColor}>
                    &quot;{testimonial.content}&quot;
                  </Text>
                  <HStack>
                    <Avatar 
                      name={testimonial.name} 
                      src={`https://i.pravatar.cc/150?img=${index}`} 
                    />
                    <Box>
                      <Text fontWeight="bold" color={textColor}>
                        {testimonial.name}
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        {testimonial.role}
                      </Text>
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

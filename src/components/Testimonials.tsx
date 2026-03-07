'use client';

import {
  Avatar,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { translations } from '@/lib/translations';

export default function Testimonials() {
  const { language } = useLanguage();
  const t = translations[language as 'en' | 'es'];

  const bg = useColorModeValue('#fffaf0', '#131920');
  const line = useColorModeValue('rgba(54, 39, 14, 0.2)', 'rgba(241, 210, 162, 0.2)');
  const cardBg = useColorModeValue('rgba(255, 253, 248, 0.88)', 'rgba(22, 32, 38, 0.9)');
  const text = useColorModeValue('#1a2e37', '#edf4f7');
  const muted = useColorModeValue('#4e656f', '#bdc9cf');
  const accent = useColorModeValue('#0f5a71', '#8bd6ef');
  const backdrop = useColorModeValue(
    'radial-gradient(56% 40% at 16% 12%, rgba(245, 196, 126, 0.28), transparent 70%), radial-gradient(60% 50% at 86% 84%, rgba(229, 152, 88, 0.24), transparent 72%), linear-gradient(170deg, #fff9ee 0%, #f8eddc 54%, #fff5e8 100%)',
    'radial-gradient(56% 40% at 16% 12%, rgba(232, 171, 92, 0.16), transparent 70%), radial-gradient(60% 50% at 86% 84%, rgba(201, 138, 74, 0.14), transparent 72%), linear-gradient(170deg, #131920 0%, #1b2026 54%, #161b20 100%)'
  );
  const revealRef = useScrollReveal();

  return (
    <Box
      ref={revealRef}
      as="section"
      position="relative"
      overflow="hidden"
      bg={bg}
      py={{ base: 16, md: 20 }}
      borderTop="1px solid"
      borderColor={line}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bg: backdrop,
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={12} align="stretch">
          <VStack spacing={4} align="start">
            <Text data-reveal textTransform="uppercase" letterSpacing="0.12em" fontWeight="800" fontSize="xs" color={accent}>
              {language === 'es' ? 'Confianza validada' : 'Validated trust'}
            </Text>
            <Heading data-reveal as="h2" size="2xl" color={text} lineHeight="1.05" fontWeight="500">
              {t.testimonials.title}
            </Heading>
          </VStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={{ base: 6, md: 7 }}>
            {t.testimonials.testimonials.map((testimonial, index) => (
              <GridItem key={testimonial.name}>
                <Box
                  data-reveal
                  h="full"
                  p={6}
                  borderRadius="20px"
                  border="1px solid"
                  borderColor={line}
                  bg={cardBg}
                  boxShadow="0 16px 46px rgba(10, 25, 33, 0.14)"
                  backdropFilter="blur(10px)"
                  transform={{ base: 'none', md: index === 1 ? 'translateY(20px)' : 'none' }}
                  transition="transform 0.25s ease"
                  _hover={{ transform: { base: 'none', md: 'translateY(-4px)' } }}
                >
                  <VStack align="start" spacing={4} h="full">
                    <Text color={accent} fontSize="3xl" lineHeight="0.8" aria-hidden>
                      &ldquo;
                    </Text>
                    <Text fontSize="md" color={text} lineHeight="1.85" flex="1">
                      {testimonial.content}
                    </Text>

                    <HStack pt={2} spacing={3}>
                      <Avatar name={testimonial.name} src={`https://i.pravatar.cc/150?img=${index + 20}`} size="sm" />
                      <Box>
                        <Text color={text} fontWeight="700" lineHeight="1.2">
                          {testimonial.name}
                        </Text>
                        <Text color={muted} fontSize="sm">
                          {testimonial.role}
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
}

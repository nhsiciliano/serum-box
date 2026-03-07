'use client';

import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { translations } from '@/lib/translations';

export default function HomeContent() {
  const { language } = useLanguage();
  const t = translations[language as 'en' | 'es'];

  const bg = useColorModeValue('#f6f3ee', '#0f171c');
  const panelBg = useColorModeValue('rgba(255, 253, 249, 0.82)', 'rgba(21, 30, 35, 0.9)');
  const titleColor = useColorModeValue('#13242d', '#f6f8f9');
  const bodyColor = useColorModeValue('#3a4b54', '#cad6dc');
  const accent = useColorModeValue('#145b70', '#8ad6ee');
  const cardBorder = useColorModeValue('rgba(19, 36, 45, 0.14)', 'rgba(246, 248, 249, 0.2)');
  const sectionLine = useColorModeValue('rgba(96, 78, 41, 0.18)', 'rgba(222, 180, 126, 0.2)');
  const heroBackdrop = useColorModeValue(
    'radial-gradient(80% 58% at 10% 8%, rgba(92, 186, 214, 0.24), transparent 72%), radial-gradient(68% 48% at 90% 12%, rgba(237, 170, 94, 0.32), transparent 74%), radial-gradient(70% 60% at 56% 100%, rgba(199, 215, 173, 0.18), transparent 76%), linear-gradient(158deg, #f8f2e6 0%, #f0e3cf 45%, #f7ecde 100%)',
    'radial-gradient(78% 58% at 8% 12%, rgba(79, 183, 215, 0.28), transparent 72%), radial-gradient(62% 42% at 88% 8%, rgba(226, 162, 90, 0.22), transparent 72%), radial-gradient(70% 60% at 56% 100%, rgba(112, 148, 129, 0.2), transparent 76%), linear-gradient(160deg, #0f171c 0%, #17252d 52%, #131e25 100%)'
  );
  const revealRef = useScrollReveal();

  const labels =
    language === 'es'
      ? ['Traza muestras', 'Controla reactivos', 'Analiza consumo']
      : ['Trace samples', 'Control reagents', 'Analyze usage'];

  return (
    <Box
      as="section"
      className="landing-grain"
      position="relative"
      overflow="hidden"
      bg={bg}
      pt={{ base: 28, md: 36 }}
      pb={{ base: 16, md: 20 }}
      borderBottom="1px solid"
      borderColor={sectionLine}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bg: heroBackdrop,
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid
          ref={revealRef}
          templateColumns={{ base: '1fr', lg: '1.05fr 0.95fr' }}
          gap={{ base: 10, lg: 12 }}
          alignItems="center"
        >
          <GridItem>
            <VStack align="start" spacing={6}>
              <Text
                data-reveal
                letterSpacing="0.12em"
                textTransform="uppercase"
                fontSize="xs"
                fontWeight="800"
                color={accent}
              >
                {language === 'es' ? 'Plataforma para laboratorios' : 'Laboratory platform'}
              </Text>

              <Heading
                data-reveal
                as="h1"
                color={titleColor}
                lineHeight={{ base: '1.02', md: '0.98' }}
                fontWeight="500"
                fontSize={{ base: '3.1rem', sm: '3.6rem', md: '4.6rem' }}
                maxW="14ch"
              >
                {t.home.title}
              </Heading>

              <Text
                data-reveal
                fontSize={{ base: 'lg', md: 'xl' }}
                lineHeight="1.7"
                color={bodyColor}
                maxW="58ch"
              >
                {t.home.subtitle}
              </Text>

              <Text data-reveal color={bodyColor} maxW="62ch" lineHeight="1.8">
                {t.home.description}
              </Text>

              <HStack data-reveal spacing={4} pt={2} flexWrap="wrap">
                <Link href="/login" passHref legacyBehavior>
                  <Button
                    as="a"
                    bg={accent}
                    color="white"
                    px={8}
                    py={6}
                    rounded="full"
                    fontWeight="700"
                    letterSpacing="0.01em"
                    _hover={{ transform: 'translateY(-2px)', bg: useColorModeValue('#0f4f61', '#6fc9e5') }}
                    transition="all 0.25s ease"
                  >
                    {t.home.startTrial}
                  </Button>
                </Link>
              </HStack>

              <HStack data-reveal spacing={3} pt={1} flexWrap="wrap">
                {labels.map((label) => (
                  <Box
                    key={label}
                    px={4}
                    py={2}
                    borderRadius="full"
                    border="1px solid"
                    borderColor={cardBorder}
                    bg={panelBg}
                    backdropFilter="blur(8px)"
                  >
                    <Text fontSize="sm" color={titleColor} fontWeight="600">
                      {label}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </VStack>
          </GridItem>

          <GridItem>
            <Box position="relative" minH={{ base: '360px', md: '480px' }}>
              <Box
                data-reveal
                position="absolute"
                top={{ base: 10, md: 6 }}
                left={{ base: 2, md: 8 }}
                right={{ base: 8, md: 20 }}
                h={{ base: '64%', md: '72%' }}
                borderRadius="28px"
                overflow="hidden"
                boxShadow="0 28px 80px rgba(12, 32, 41, 0.25)"
                border="1px solid"
                borderColor={cardBorder}
              >
                <NextImage
                  src="/images/gestion-muestras.jpg"
                  alt={t.features.title1}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </Box>

              <Box
                data-reveal
                position="absolute"
                bottom={{ base: 4, md: 0 }}
                right={{ base: 0, md: 2 }}
                maxW={{ base: '86%', md: '70%' }}
                bg={panelBg}
                border="1px solid"
                borderColor={cardBorder}
                borderRadius="24px"
                p={{ base: 5, md: 6 }}
                boxShadow="0 18px 54px rgba(10, 24, 31, 0.2)"
                backdropFilter="blur(14px)"
              >
                <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color={accent} fontWeight="800">
                  {language === 'es' ? 'Flujo integral' : 'Integrated flow'}
                </Text>
                <Heading as="h2" mt={2} size="md" color={titleColor} lineHeight="1.2" fontWeight="500">
                  {t.features.title2}
                </Heading>
                <Text mt={3} color={bodyColor} lineHeight="1.75" fontSize="sm">
                  {t.features.description2}
                </Text>
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}

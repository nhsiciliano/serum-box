'use client';

import { useEffect, useMemo, useState } from 'react';
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
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { featureCopy, LandingLanguage } from '@/lib/landingTranslations';

export default function FeatureSlider() {
  const { language } = useLanguage();
  const locale: LandingLanguage = language === 'es' ? 'es' : 'en';
  const t = featureCopy[locale];

  const features = useMemo(
    () => [
      {
        title: t.title1,
        description: t.description1,
        image: '/images/gestion-muestras.jpg',
      },
      {
        title: t.title2,
        description: t.description2,
        image: '/images/gradillas-personalizables.jpg',
      },
      {
        title: t.title3,
        description: t.description3,
        image: '/images/informacion-detallada.jpg',
      },
      {
        title: t.title4,
        description: t.description4,
        image: '/images/busqueda-avanzada.jpg',
      },
      {
        title: t.title5,
        description: t.description5,
        image: '/images/stock-manager.jpg',
      },
      {
        title: t.title6,
        description: t.description6,
        image: '/images/stock-analytics.jpg',
      },
    ],
    [t]
  );

  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [features.length, isPaused, prefersReducedMotion]);

  const sectionBg = useColorModeValue('#e8f1f4', '#0e1d25');
  const sectionLine = useColorModeValue('rgba(11, 55, 71, 0.22)', 'rgba(149, 213, 237, 0.28)');
  const text = useColorModeValue('#1a303a', '#edf4f7');
  const muted = useColorModeValue('#4b616b', '#b5c5cc');
  const accent = useColorModeValue('#0f5a71', '#85d4ef');
  const panel = useColorModeValue('rgba(255, 252, 247, 0.88)', 'rgba(20, 31, 38, 0.9)');
  const sectionBackdrop = useColorModeValue(
    'radial-gradient(64% 56% at 89% 18%, rgba(64, 171, 205, 0.35), transparent 74%), radial-gradient(48% 42% at 6% 82%, rgba(131, 208, 232, 0.28), transparent 72%), linear-gradient(162deg, #e7f1f5 0%, #d9e8ee 46%, #edf5f8 100%)',
    'radial-gradient(64% 56% at 89% 18%, rgba(76, 183, 217, 0.28), transparent 74%), radial-gradient(48% 42% at 6% 82%, rgba(105, 193, 222, 0.2), transparent 72%), linear-gradient(162deg, #0d1b23 0%, #112632 46%, #0f2029 100%)'
  );
  const sheen = useColorModeValue(
    'linear-gradient(110deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0) 42%)',
    'linear-gradient(110deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0) 42%)'
  );
  const revealRef = useScrollReveal();

  return (
    <Box
      ref={revealRef}
      as="section"
      position="relative"
      overflow="hidden"
      bg={sectionBg}
      py={{ base: 16, md: 20 }}
      borderTop="1px solid"
      borderColor={sectionLine}
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bg: sectionBackdrop,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bg: sheen,
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid templateColumns={{ base: '1fr', lg: '0.78fr 1.22fr' }} gap={{ base: 8, lg: 10 }}>
          <GridItem>
            <VStack align="start" spacing={5}>
              <Text data-reveal textTransform="uppercase" letterSpacing="0.12em" fontSize="xs" fontWeight="800" color={accent}>
                {language === 'es' ? 'Módulos principales' : 'Core modules'}
              </Text>
              <Heading data-reveal as="h2" size="2xl" fontWeight="500" lineHeight="1.05" color={text}>
                {t.discover}
              </Heading>
              <Text data-reveal color={muted} lineHeight="1.8" maxW="44ch">
                {t.intro}
              </Text>

              <Button
                data-reveal
                variant="outline"
                size="sm"
                borderColor={sectionLine}
                color={text}
                _hover={{ borderColor: accent, color: accent }}
                onClick={() => setIsPaused((prev) => !prev)}
                alignSelf="start"
              >
                {prefersReducedMotion
                  ? language === 'es'
                    ? 'Animación desactivada'
                    : 'Animation disabled'
                  : isPaused
                    ? language === 'es'
                      ? 'Reanudar carrusel'
                      : 'Resume carousel'
                    : language === 'es'
                      ? 'Pausar carrusel'
                      : 'Pause carousel'}
              </Button>

              <VStack align="stretch" spacing={2} w="full" pt={3}>
                {features.map((feature, index) => {
                  const isActive = index === currentFeature;

                  return (
                    <Box
                      data-reveal
                      key={feature.title}
                      as="button"
                      onClick={() => setCurrentFeature(index)}
                      textAlign="left"
                      p={4}
                      borderRadius="14px"
                      border="1px solid"
                      borderColor={isActive ? accent : sectionLine}
                      bg={isActive ? panel : 'transparent'}
                      transition="all 0.2s ease"
                      _hover={{ borderColor: accent, transform: 'translateX(2px)' }}
                    >
                      <HStack spacing={3} align="start">
                        <Text color={isActive ? accent : muted} fontWeight="700" fontSize="sm" minW="22px">
                          {String(index + 1).padStart(2, '0')}
                        </Text>
                        <Text color={text} fontWeight={isActive ? '700' : '600'} lineHeight="1.4">
                          {feature.title}
                        </Text>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </VStack>
          </GridItem>

          <GridItem>
            <Box
              data-reveal
              position="relative"
              borderRadius="28px"
              overflow="hidden"
              border="1px solid"
              borderColor={sectionLine}
              minH={{ base: '410px', md: '500px' }}
              boxShadow="0 22px 72px rgba(10, 24, 31, 0.22)"
            >
              <NextImage
                src={features[currentFeature].image}
                alt={features[currentFeature].title}
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                style={{ objectFit: 'cover' }}
              />

              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(180deg, rgba(7, 20, 26, 0.05) 28%, rgba(7, 20, 26, 0.78) 100%)"
              />

              <Box position="absolute" top={0} left={0} right={0} h="4px" bg="rgba(255,255,255,0.26)">
                <Box
                  h="full"
                  bg={accent}
                  w="100%"
                  key={currentFeature}
                  sx={{ animation: prefersReducedMotion || isPaused ? 'none' : 'feature-progress 8s linear forwards' }}
                />
              </Box>

              <VStack position="absolute" left={{ base: 4, md: 7 }} right={{ base: 4, md: 7 }} bottom={{ base: 4, md: 7 }} align="start" spacing={3}>
                <Box px={3} py={1.5} borderRadius="full" bg="rgba(255,255,255,0.14)" backdropFilter="blur(10px)">
                  <Text color="white" fontWeight="700" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase">
                    {language === 'es' ? 'Vista en acción' : 'Live workflow'}
                  </Text>
                </Box>

                <Heading as="h3" color="white" size="lg" fontWeight="500" lineHeight="1.15" maxW="22ch">
                  {features[currentFeature].title}
                </Heading>

                <Text color="rgba(255,255,255,0.9)" fontSize="md" lineHeight="1.75" maxW="58ch">
                  {features[currentFeature].description}
                </Text>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}

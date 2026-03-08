'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { faqCopy, LandingLanguage } from '@/lib/landingTranslations';

export default function FAQSection() {
  const { language } = useLanguage();
  const locale: LandingLanguage = language === 'es' ? 'es' : 'en';
  const t = faqCopy[locale];

  const bg = useColorModeValue('#e5efe8', '#102025');
  const line = useColorModeValue('rgba(21, 62, 53, 0.2)', 'rgba(159, 226, 206, 0.24)');
  const heading = useColorModeValue('#162731', '#eef3f5');
  const text = useColorModeValue('#415862', '#c4d0d5');
  const accent = useColorModeValue('#0f5a71', '#8fd8ef');
  const panelBg = useColorModeValue('rgba(255, 252, 246, 0.78)', 'rgba(20, 30, 36, 0.9)');
  const hoverBg = useColorModeValue('#f5efe5', '#1d2a31');
  const faqBackdrop = useColorModeValue(
    'radial-gradient(68% 52% at 92% 10%, rgba(71, 179, 148, 0.24), transparent 70%), radial-gradient(56% 50% at 8% 92%, rgba(120, 203, 177, 0.22), transparent 72%), linear-gradient(164deg, #e4efe7 0%, #d6e8dd 46%, #eaf5ef 100%)',
    'radial-gradient(68% 52% at 92% 10%, rgba(71, 179, 148, 0.2), transparent 70%), radial-gradient(56% 50% at 8% 92%, rgba(120, 203, 177, 0.16), transparent 72%), linear-gradient(164deg, #102025 0%, #132a2d 46%, #102327 100%)'
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
        bg: faqBackdrop,
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid templateColumns={{ base: '1fr', lg: '0.78fr 1.22fr' }} gap={{ base: 8, lg: 12 }}>
          <GridItem>
            <VStack align="start" spacing={5} position={{ lg: 'sticky' }} top={{ lg: '110px' }}>
              <Text data-reveal textTransform="uppercase" letterSpacing="0.12em" fontWeight="800" fontSize="xs" color={accent}>
                FAQ
              </Text>
              <Heading data-reveal as="h2" size="2xl" color={heading} lineHeight="1.05" fontWeight="500">
              {t.title}
              </Heading>
              <Text data-reveal color={text} maxW="42ch" lineHeight="1.85">
                {language === 'es'
                  ? 'Respuestas claras para implementar Serum Box de forma segura y rápida en tu laboratorio.'
                  : 'Clear answers to implement Serum Box quickly and safely in your laboratory.'}
              </Text>
            </VStack>
          </GridItem>

          <GridItem>
            <Accordion allowToggle>
              {t.questions.map((faq) => (
                <AccordionItem
                  data-reveal
                  key={faq.q}
                  mb={3}
                  border="1px solid"
                  borderColor={line}
                  borderRadius="16px"
                  bg={panelBg}
                  overflow="hidden"
                  backdropFilter="blur(8px)"
                >
                  <h3>
                    <AccordionButton px={5} py={4} _hover={{ bg: hoverBg }}>
                      <Box flex="1" textAlign="left">
                        <Text color={heading} fontSize={{ base: 'md', md: 'lg' }} fontWeight="650" lineHeight="1.4">
                          {faq.q}
                        </Text>
                      </Box>
                      <AccordionIcon color={accent} />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={5} pb={5}>
                    <Text color={text} lineHeight="1.8">
                      {faq.a}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}

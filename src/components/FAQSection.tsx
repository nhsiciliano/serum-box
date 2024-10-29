"use client"

import {
  Box,
  Container,
  Heading,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function FAQSection() {
  const { language } = useLanguage();
  const t = translations[language as 'en' | 'es'];
  
  const bgColor = useColorModeValue('green.200', 'green.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const questionColor = useColorModeValue('teal.600', 'teal.200');

  return (
    <Box bg={bgColor} py={20} color={textColor}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading as="h2" size="xl" textAlign="center">
            {t.faq.title}
          </Heading>
          <Accordion allowToggle width="100%">
            {t.faq.questions.map((faq, index) => (
              <AccordionItem key={index}>
                <h3>
                  <AccordionButton py={4}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="lg" fontWeight="semibold" color={questionColor}>
                        {faq.q}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h3>
                <AccordionPanel pb={4}>
                  <Text fontSize="md">{faq.a}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>
    </Box>
  );
}

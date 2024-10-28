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

const faqs = [
  {
    question: '¿Qué es Serum Box y cómo funciona?',
    answer: 'Serum Box es una plataforma de gestión de muestras de suero que permite organizar, rastrear y analizar muestras de manera eficiente. Funciona proporcionando herramientas para crear gradillas personalizables, registrar información detallada de las muestras y realizar búsquedas avanzadas.'
  },
  {
    question: '¿Puedo personalizar las gradillas según mis necesidades?',
    answer: 'Sí, Serum Box permite crear gradillas personalizables. Por ejemplo, puedes configurar una gradilla con ubicaciones de A a J de arriba a abajo y de 1 a 10 de izquierda a derecha, o cualquier otra configuración que se adapte a tus necesidades específicas.'
  },
  {
    question: '¿Qué tipo de información puedo guardar para cada muestra?',
    answer: 'Puedes guardar una amplia variedad de información para cada muestra, incluyendo el nombre y apellido del paciente, fecha de nacimiento, fecha de la muestra, número de protocolo, y cualquier otro dato relevante para tu investigación.'
  },
  {
    question: '¿Es seguro almacenar información sensible en Serum Box?',
    answer: 'Sí, Serum Box prioriza la seguridad de los datos. Utilizamos encriptación de última generación y cumplimos con todas las regulaciones pertinentes para proteger la información sensible de los pacientes y las muestras.'
  },
  {
    question: '¿Puedo integrar Serum Box con otros sistemas de laboratorio?',
    answer: 'Sí, Serum Box ofrece opciones de integración con sistemas LIMS (Laboratory Information Management System) comunes y otros software de laboratorio. Contáctanos para obtener más información sobre integraciones específicas.'
  }
];

export default function FAQSection() {
  const bgColor = useColorModeValue('green.200', 'green.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const questionColor = useColorModeValue('teal.600', 'teal.200');

  return (
    <Box bg={bgColor} py={20} color={textColor}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading as="h2" size="xl" textAlign="center">
            Preguntas frecuentes
          </Heading>
          <Accordion allowToggle width="100%">
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <h3>
                  <AccordionButton py={4}>
                    <Box flex="1" textAlign="left">
                      <Text fontSize="lg" fontWeight="semibold" color={questionColor}>
                        {faq.question}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h3>
                <AccordionPanel pb={4}>
                  <Text fontSize="md">{faq.answer}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      </Container>
    </Box>
  );
}

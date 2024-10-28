"use client"

import { Box, Heading, Text, VStack, HStack, Button, SimpleGrid, List, ListItem, useColorModeValue, Select } from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
  </svg>
);

const plans = [
  {
    name: "Gratis",
    price: "0",
    features: [
      "Funciones premium por 15 días",
      "Hasta 162 muestras",
      "2 gradillas personalizables",
      "Soporte por email"
    ]
  },
  {
    name: "Standard",
    prices: {
      3: 3.8,
      6: 3,
      12: 2.3
    },
    features: [
      "Hasta 1000 muestras",
      "5 gradillas personalizables",
      "Soporte por email prioritario"
    ]
  },
  {
    name: "Premium",
    prices: {
      3: 4.5,
      6: 3.8,
      12: 3
    },
    features: [
      "Muestras ilimitadas",
      "Gradillas ilimitadas",
      "Soporte por email prioritario"
    ]
  }
];

export default function PricingPlans() {
  const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(3);
  const bgColor = useColorModeValue('green.400', 'green.700');
  const headingColor = useColorModeValue('black', 'white');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('black', 'white');
  const checkColor = useColorModeValue('green.500', 'green.300');

  return (
    <Box bg={bgColor} py={12}>
      <VStack spacing={8}>
        <Heading as="h2" color={headingColor} size="xl">Planes de Suscripción</Heading>
        <Select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(Number(e.target.value) as 3 | 6 | 12)}
          width="auto"
          mb={4}
        >
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </Select>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full" maxWidth="5xl">
          {plans.map((plan) => (
            <Box key={plan.name} bg={cardBgColor} p={6} borderRadius="lg" boxShadow="lg">
              <VStack spacing={4} align="stretch">
                <Heading as="h3" color={textColor} size="lg">{plan.name}</Heading>
                <Text fontSize="3xl" color={textColor} fontWeight="bold">
                  ${typeof plan.price === 'string' ? plan.price : plan.prices[selectedDuration].toFixed(2)}
                  <Text as="span" fontSize="sm" fontWeight="normal">
                    {plan.name !== "Gratis" ? `/mes` : ""}
                  </Text>
                </Text>
                {plan.name !== "Gratis" && (
                  <Text fontSize="sm" color={textColor}>
                    Contratando {selectedDuration} meses
                  </Text>
                )}
                <List spacing={3}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <HStack>
                        <Box as="span" color={checkColor}>
                          <CheckIcon />
                        </Box>
                        <Text color={textColor}>{feature}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
                <Link href="/login" passHref legacyBehavior>
                  <Button colorScheme="blue" size="lg">
                    {plan.name === "Gratis" ? "Comenzar Gratis" : "Comenzar " + plan.name}
                  </Button>
                </Link>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

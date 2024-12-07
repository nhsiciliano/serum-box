"use client"

import { Box, Heading, Text, VStack, HStack, Button, SimpleGrid, List, ListItem, useColorModeValue, ButtonGroup } from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

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

export default function PricingPlans() {
  const [selectedDuration, setSelectedDuration] = useState<3 | 6 | 12>(3);
  const { language } = useLanguage();
  const t = translations[language];

  const bgColor = useColorModeValue('green.200', 'green.800');
  const headingColor = useColorModeValue('black', 'white');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('black', 'white');
  const checkColor = useColorModeValue('green.500', 'green.300');

  const plans = [
    {
      name: t.pricing.planNames.free,
      price: "0",
      features: t.pricing.features.free
    },
    {
      name: t.pricing.planNames.standard,
      prices: {
        3: 3.8,
        6: 3,
        12: 2.3
      },
      features: t.pricing.features.standard
    },
    {
      name: t.pricing.planNames.premium,
      prices: {
        3: 4.5,
        6: 3.8,
        12: 3
      },
      features: t.pricing.features.premium
    }
  ];

  const durations = [
    { value: 3, label: `3 ${t.pricing.duration.months}` },
    { value: 6, label: `6 ${t.pricing.duration.months}` },
    { value: 12, label: `12 ${t.pricing.duration.months}` }
  ];

  return (
    <Box bg={bgColor} py={12}>
      <VStack spacing={8}>
        <Heading as="h2" color={headingColor} size="xl">
          {t.pricing.title}
        </Heading>
        
        <ButtonGroup size="md" isAttached variant="outline">
          {durations.map(duration => (
            <Button
              key={duration.value}
              onClick={() => setSelectedDuration(duration.value as 3 | 6 | 12)}
              colorScheme={selectedDuration === duration.value ? "teal" : "gray"}
              variant={selectedDuration === duration.value ? "solid" : "outline"}
            >
              {duration.label}
            </Button>
          ))}
        </ButtonGroup>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full" maxWidth="5xl">
          {plans.map((plan) => (
            <Box key={plan.name} bg={cardBgColor} p={6} borderRadius="lg" boxShadow="lg">
              <VStack spacing={4} align="stretch">
                <Heading as="h3" color={textColor} size="lg">{plan.name}</Heading>
                <Text fontSize="3xl" color={textColor} fontWeight="bold">
                  ${typeof plan.price === 'string' ? plan.price : plan.prices[selectedDuration].toFixed(2)}
                  <Text as="span" fontSize="sm" fontWeight="normal">
                    {plan.name !== t.pricing.planNames.free ? t.pricing.duration.perMonth : ""}
                  </Text>
                </Text>
                {plan.name !== t.pricing.planNames.free && (
                  <Text fontSize="sm" color={textColor}>
                    {t.pricing.duration.contractFor} {selectedDuration} {t.pricing.duration.months}
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
                    {t.pricing.startButton[plan.name.toLowerCase() === 'gratis' ? 'free' : plan.name.toLowerCase() as keyof typeof t.pricing.startButton]}
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

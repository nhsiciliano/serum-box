"use client"

import { useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, SimpleGrid, List, ListItem, useColorModeValue, ButtonGroup } from '@chakra-ui/react';
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
  const { language } = useLanguage();
  const t = translations[language];
  const [billingCycle, setBillingCycle] = useState('monthly');

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const popularBorderColor = useColorModeValue('brand.500', 'brand.300');

  const plans = [
    {
      name: t.pricing.planNames.free,
      prices: { monthly: '$0', yearly: '$0' },
      period: t.pricing.forever,
      features: t.pricing.features.free,
      buttonText: t.pricing.postTrialPlan,
      isDisabled: true,
      isPopular: false,
    },
    {
      name: t.pricing.planNames.standard,
      prices: { monthly: '$10', yearly: '$100' },
      features: t.pricing.features.standard,
      buttonText: t.pricing.startTrial,
      isDisabled: false,
      isPopular: false,
    },
    {
      name: t.pricing.planNames.premium,
      prices: { monthly: '$18', yearly: '$196' },
      features: t.pricing.features.premium,
      buttonText: t.pricing.startTrial,
      isDisabled: false,
      isPopular: true,
    },
  ];

  return (
    <Box bg={bgColor} py={{ base: 16, md: 24 }}>
      <VStack spacing={6} textAlign="center" maxW="6xl" mx="auto">
        <Heading as="h1" size="2xl" color={headingColor}>
          {t.pricing.title}
        </Heading>
        <Text fontSize="xl" color={textColor} maxW="2xl">
          {t.pricing.trialSubtitle}
        </Text>
        <ButtonGroup isAttached variant="outline" size="md">
          <Button 
            onClick={() => setBillingCycle('monthly')}
            isActive={billingCycle === 'monthly'}
            _active={{ bg: 'brand.500', color: 'green.600' }}
          >
            {t.pricing.monthly}
          </Button>
          <Button 
            onClick={() => setBillingCycle('yearly')}
            isActive={billingCycle === 'yearly'}
            _active={{ bg: 'brand.500', color: 'green.600' }}
          >
            {t.pricing.yearly}
          </Button>
        </ButtonGroup>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full" maxWidth="6xl" mx="auto" mt={16}>
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.prices.monthly : plan.prices.yearly;
          let periodText = '';
          if (plan.name !== t.pricing.planNames.free) {
            periodText = billingCycle === 'monthly' ? `/ ${t.pricing.month}` : `/ ${t.pricing.year}`;
          }

          return (
            <Box
              key={plan.name}
              bg={cardBgColor}
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              border="2px solid"
              borderColor={plan.isPopular ? popularBorderColor : 'transparent'}
              transform={plan.isPopular ? 'scale(1.05)' : 'none'}
              transition="transform 0.2s, box-shadow 0.2s"
              _hover={!plan.isDisabled ? {
                transform: 'translateY(-5px)',
                boxShadow: 'xl',
              } : {}}
            >
              <VStack spacing={6} align="stretch" h="100%">
                <Box flexGrow={1}>
                  <Heading as="h3" size="lg" color={headingColor}>{plan.name}</Heading>
                  <HStack alignItems="baseline" mt={4}>
                    <Text fontSize="4xl" fontWeight="bold" color={headingColor}>{price}</Text>
                    <Text color={textColor}>{plan.name === t.pricing.planNames.free ? plan.period : periodText}</Text>
                  </HStack>
                  <List spacing={3} mt={6} textAlign="start">
                    {plan.features.map((feature: string) => (
                      <ListItem key={feature}>
                        <HStack align="center">
                          <Box as="span" color="green.500">
                            <CheckIcon />
                          </Box>
                          <Text color={textColor}>{feature}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Link href="/register" passHref legacyBehavior>
                  <Button 
                    as="a"
                    colorScheme={'green'}
                    size="lg" 
                    w="100%"
                    isDisabled={plan.isDisabled}
                    bg={plan.isPopular ? 'brand.500' : 'brand.400'}
                    _hover={!plan.isDisabled ? { bg: plan.isPopular ? 'brand.600' : 'brand.500' } : {}}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </VStack>
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  );
}

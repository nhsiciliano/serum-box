"use client";

import { Box, Flex, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import NextImage from 'next/image';
import { ReactNode } from 'react';

type AuthSplitLayoutProps = {
  children: ReactNode;
  contextTitle: string;
  contextDescription: string;
};

export default function AuthSplitLayout({
  children,
  contextTitle,
  contextDescription,
}: AuthSplitLayoutProps) {
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const heroOverlay = useColorModeValue(
    'linear-gradient(145deg, rgba(13, 148, 136, 0.42) 0%, rgba(17, 24, 39, 0.76) 80%)',
    'linear-gradient(145deg, rgba(19, 78, 74, 0.5) 0%, rgba(3, 7, 18, 0.82) 80%)'
  );
  const heroCardBg = useColorModeValue('rgba(15, 23, 42, 0.64)', 'rgba(15, 23, 42, 0.72)');

  return (
    <Flex minH="100vh" bg={pageBg}>
      <Box flex="1" px={{ base: 4, sm: 6, md: 8 }} py={{ base: 8, md: 12 }} display="flex" alignItems="center">
        <Box width="full" maxW="460px" mx="auto">
          {children}
        </Box>
      </Box>

      <Box
        flex="1"
        minH="100vh"
        position="relative"
        display={{ base: 'none', lg: 'block' }}
        borderLeft="1px solid"
        borderColor="blackAlpha.200"
      >
        <NextImage
          src="/login-image.jpg"
          alt="Laboratory access context"
          fill
          sizes="50vw"
          priority
          style={{ objectFit: 'cover' }}
        />
        <Box position="absolute" inset="0" bgImage={heroOverlay} />

        <VStack
          position="absolute"
          bottom="12"
          left="10"
          right="10"
          align="stretch"
          spacing={3}
          p={6}
          borderRadius="xl"
          bg={heroCardBg}
          border="1px solid"
          borderColor="whiteAlpha.300"
          color="white"
          backdropFilter="blur(3px)"
        >
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" fontWeight="semibold" color="teal.100">
            Protocolo Serum
          </Text>
          <Text fontSize="2xl" fontWeight="semibold" lineHeight="1.2">
            {contextTitle}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.900">
            {contextDescription}
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

import { Box, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import NextImage from 'next/image';
import { ReactNode } from 'react';

type AuthCardProps = {
  title: string;
  description: string;
  badge: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({ title, description, badge, children, footer }: AuthCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const titleColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const bodyColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBg = useColorModeValue('teal.50', 'teal.900');
  const badgeColor = useColorModeValue('teal.700', 'teal.100');

  return (
    <Box
      width="full"
      p={{ base: 6, md: 8 }}
      bg={cardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={cardBorder}
      boxShadow="0 16px 40px rgba(15, 23, 42, 0.08)"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="flex-start" spacing={4}>
          <Box position="relative" width="146px" height="42px">
            <NextImage
              src="/images/serum-box.png"
              alt="Serum Box Logo"
              fill
              sizes="146px"
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box
            px={3}
            py={1.5}
            borderRadius="full"
            bg={badgeBg}
            color={badgeColor}
            fontSize="xs"
            fontWeight="semibold"
            lineHeight="1"
            whiteSpace="nowrap"
          >
            {badge}
          </Box>
        </HStack>

        <VStack spacing={1} align="stretch">
          <Text color={titleColor} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="700" lineHeight="1.1">
            {title}
          </Text>
          <Text color={bodyColor} fontSize="sm">
            {description}
          </Text>
        </VStack>

        {children}
        {footer}
      </VStack>
    </Box>
  );
}

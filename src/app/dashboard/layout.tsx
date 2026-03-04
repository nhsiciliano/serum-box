"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Center, Spinner, useColorModeValue } from '@chakra-ui/react';
import DashboardHeader from '@/components/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const radialBg = useColorModeValue(
    'radial-gradient(1200px circle at 6% -10%, rgba(23, 176, 127, 0.12), transparent 45%), radial-gradient(1000px circle at 95% -20%, rgba(15, 23, 42, 0.09), transparent 40%)',
    'radial-gradient(1200px circle at 6% -10%, rgba(23, 176, 127, 0.14), transparent 45%), radial-gradient(1000px circle at 95% -20%, rgba(148, 163, 184, 0.1), transparent 40%)'
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Center h="100vh" bg={pageBg}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size="xl"
        />
      </Center>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box minH="100vh" bg={pageBg} bgImage={radialBg}>
      <Box maxW="8xl" mx="auto" px={{ base: 4, md: 6, xl: 8 }} py={{ base: 4, md: 6 }}>
        <DashboardHeader />
        <Box mt={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, useColorModeValue, Link, useToast, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextImage from 'next/image';

export default function LoginForm({
  onSwitchToRegister,
  onSwitchToRecover
}: {
  onSwitchToRegister: () => void;
  onSwitchToRecover: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      const lowerError = result.error.toLowerCase();
      const description = lowerError.includes('verify your email')
        ? 'Please confirm your email from the Supabase verification link before signing in.'
        : 'Incorrect email or password. Please try again.';

      toast({
        title: "Login Error",
        description,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else {
      router.push('/dashboard');
    }
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box maxWidth="400px" margin="auto" p={6} bg={bgColor} borderRadius="md" boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Box position="relative" width="200px" height="56px" mx="auto">
          <NextImage
            src="/images/serum-box.png"
            alt="Serum Box Logo"
            fill
            sizes="200px"
            priority
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Text fontSize="xl" fontWeight="bold" textAlign="center" color={textColor}>
          Start your experience
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="black">Email</FormLabel>
              <Input type="email" textColor="gray.800" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel color="black">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  textColor="gray.800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={isLoading}
              loadingText="Signing in"
            >
              Sign In
            </Button>
            <Text textAlign="center" color="gray.500" fontSize="sm">
              Forgot your password? <Link color="teal.500" onClick={onSwitchToRecover}>Recover here</Link>
            </Text>
            <Text textAlign="center" color="gray.500" fontSize="sm">
              Don&apos;t have an account? <Link color="teal.500" onClick={onSwitchToRegister}>Register here</Link>
            </Text>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

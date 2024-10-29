"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Image, useColorModeValue, Link, Flex, useToast } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

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
      toast({
        title: "Login Error",
        description: "Incorrect email or password. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box maxWidth="400px" margin="auto" p={6} bg={bgColor} borderRadius="md" boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Image 
          src="/images/serum-box.png" 
          alt="Serum Box Logo" 
          width="200px" 
          height="auto" 
          margin="auto"
        />
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
              <Input type="password" textColor="gray.800" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
          </VStack>
        </form>
        <Button 
          onClick={handleGoogleSignIn} 
          width="full"
          bg="white"
          color="gray.800"
          border="1px"
          borderColor="green.700"
          _hover={{ bg: 'gray.100' }}
        >
          <Flex align="center" justify="center" width="100%">
            <FcGoogle size="20px" />
            <Text ml={2}>Sign in with Google</Text>
          </Flex>
        </Button>
        <Text textAlign="center" color="gray.500" fontSize="sm">
          Don&apos;t have an account? <Link color="teal.500" onClick={onSwitchToRegister}>Register here</Link>
        </Text>
      </VStack>
    </Box>
  );
}

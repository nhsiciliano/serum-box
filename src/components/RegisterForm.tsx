"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Image, useColorModeValue, Link, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long and include letters, numbers, and at least one special character",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      if (registerResponse.ok) {
        await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        toast({
          title: "Registration successful",
          description: "Please verify your email",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        const data = await registerResponse.json();
        throw new Error(data.message || 'Registration error');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Registration could not be completed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box maxWidth="400px" margin="auto" p={6} bg={bgColor} borderRadius="md" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Image 
          src="/images/serum-box.png" 
          alt="Serum Box Logo" 
          width="200px" 
          height="auto" 
          margin="auto"
        />
        <Text fontSize="xl" fontWeight="bold" textAlign="center" color={textColor}>
          Create your account
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="black">Name</FormLabel>
              <Input 
                type="text" 
                placeholder="Michael Scott"
                textColor="gray.800" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </FormControl>
            <FormControl>
              <FormLabel color="black">Email</FormLabel>
              <Input 
                type="email" 
                placeholder="michaelscott@gmail.com"
                textColor="gray.800" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </FormControl>
            <FormControl>
              <FormLabel color="black">Password</FormLabel>
              <Input type="password" placeholder='********' textColor="gray.800" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel color="black">Confirm Password</FormLabel>
              <Input type="password" placeholder='********' textColor="gray.800" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full" isLoading={isLoading}>Register</Button>
          </VStack>
        </form>
        <Text textAlign="center" color="gray.500" fontSize="sm">
          Already have an account? <Link color="teal.500" onClick={onSwitchToLogin}>Sign in here</Link>
        </Text>
      </VStack>
    </Box>
  );
}

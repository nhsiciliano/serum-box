"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, useColorModeValue, Link, useToast, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextImage from 'next/image';

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        toast({
          title: "Registration successful",
          description: "Check your email and confirm your account from the Supabase link.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        onSwitchToLogin();
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
          Create your account
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="black">Name/Company</FormLabel>
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
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='********'
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
            <FormControl>
              <FormLabel color="black">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='********'
                  textColor="gray.800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
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

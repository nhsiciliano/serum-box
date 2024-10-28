"use client"

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Image, useColorModeValue, Link, Flex, useToast } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc'; // Importamos el icono de Google

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
        title: "Error de inicio de sesión",
        description: "Email o contraseña incorrectos. Por favor, inténtalo de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else {
      // Redirigir al dashboard
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
          Comienza tu experiencia
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="black">Email</FormLabel>
              <Input type="email" textColor="gray.800" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel color="black">Contraseña</FormLabel>
              <Input type="password" textColor="gray.800" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="full" 
              isLoading={isLoading}
              loadingText="Iniciando sesión"
            >
              Iniciar Sesión
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
            <Text ml={2}>Iniciar con Google</Text>
          </Flex>
        </Button>
        <Text textAlign="center" color="gray.500" fontSize="sm">
          ¿No tienes una cuenta? <Link color="teal.500" onClick={onSwitchToRegister}>Regístrate aquí</Link>
        </Text>
      </VStack>
    </Box>
  );
}

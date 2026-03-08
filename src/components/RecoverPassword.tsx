"use client"

import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import AuthCard from '@/components/auth/AuthCard';

export default function RecoverPassword({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const fieldBg = useColorModeValue('gray.50', 'gray.700');
  const fieldBorder = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const helperColor = useColorModeValue('gray.500', 'gray.400');
  const inputTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const inputPlaceholderColor = useColorModeValue('gray.500', 'gray.400');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Correo de recuperación enviado',
          description: 'Revisá tu correo para continuar con el restablecimiento de contraseña.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        onBackToLogin();
      } else {
        throw new Error(data.message || 'Error al enviar el correo de recuperación');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el correo de recuperación. Intentá nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      badge="Recuperación"
      title="Recuperar acceso"
      description="Te enviaremos un enlace seguro para restablecer tu contraseña y volver a tu espacio."
      footer={
        <Text textAlign="center" color={helperColor} fontSize="sm">
          ¿Recordás tu contraseña?{' '}
          <Button variant="link" color="teal.600" fontWeight="semibold" onClick={onBackToLogin}>
            Volver al inicio de sesión
          </Button>
        </Text>
      }
    >
      <VStack spacing={4} align="stretch">
        <HStack
          px={3}
          py={2.5}
          bg={fieldBg}
          border="1px solid"
          borderColor={fieldBorder}
          borderRadius="lg"
          justify="space-between"
        >
          <Text fontSize="xs" color={helperColor} textTransform="uppercase" letterSpacing="0.08em" fontWeight="semibold">
            Paso del protocolo
          </Text>
          <Text fontSize="sm" color={labelColor} fontWeight="medium">
            Verificación de correo
          </Text>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Correo electrónico</FormLabel>
              <Input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                bg={fieldBg}
                color={inputTextColor}
                borderColor={fieldBorder}
                focusBorderColor="teal.400"
                _hover={{ borderColor: 'teal.300' }}
                _placeholder={{ color: inputPlaceholderColor, opacity: 1 }}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={isLoading}
              loadingText="Enviando"
            >
              Enviar correo de recuperación
            </Button>
          </VStack>
        </form>
      </VStack>
    </AuthCard>
  );
}

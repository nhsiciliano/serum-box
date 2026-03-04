"use client"

import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthCard from '@/components/auth/AuthCard';

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
  const fieldBg = useColorModeValue('gray.50', 'gray.700');
  const fieldBorder = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const helperColor = useColorModeValue('gray.500', 'gray.400');
  const inputTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const inputPlaceholderColor = useColorModeValue('gray.500', 'gray.400');

  const inputStyles = {
    bg: fieldBg,
    color: inputTextColor,
    borderColor: fieldBorder,
    focusBorderColor: 'teal.400',
    _hover: { borderColor: 'teal.300' },
    _placeholder: { color: inputPlaceholderColor, opacity: 1 },
  };

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
        ? 'Antes de iniciar sesión, confirmá tu correo desde el enlace de verificación de Supabase.'
        : 'El correo o la contraseña no son correctos. Probá de nuevo.';

      toast({
        title: 'Error de inicio de sesión',
        description,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <AuthCard
      badge="Acceso"
      title="Iniciá sesión en tu espacio"
      description="Accedé con tus credenciales para seguir gestionando inventario y trazabilidad de muestras."
      footer={
        <VStack spacing={2} align="stretch">
          <Text textAlign="center" color={helperColor} fontSize="sm">
            ¿Te olvidaste tu contraseña?{' '}
            <Link color="teal.600" fontWeight="semibold" onClick={onSwitchToRecover}>
              Recuperar acceso
            </Link>
          </Text>
          <Text textAlign="center" color={helperColor} fontSize="sm">
            ¿No tenés cuenta?{' '}
            <Link color="teal.600" fontWeight="semibold" onClick={onSwitchToRegister}>
              Registrate
            </Link>
          </Text>
        </VStack>
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
            Autenticación
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
                {...inputStyles}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  {...inputStyles}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    color={helperColor}
                    _hover={{ bg: 'blackAlpha.100' }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={isLoading}
              loadingText="Ingresando"
            >
              Iniciar sesión
            </Button>
          </VStack>
        </form>
      </VStack>
    </AuthCard>
  );
}

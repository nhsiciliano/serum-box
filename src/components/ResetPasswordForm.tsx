"use client"

import { useEffect, useState } from 'react';
import {
  Button,
  Center,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import AuthCard from '@/components/auth/AuthCard';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);

  const toast = useToast();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
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

  useEffect(() => {
    const initializeRecoverySession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error validating recovery session:', error);
      }

      setCanReset(Boolean(data.session));
      setIsCheckingSession(false);
    };

    initializeRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setCanReset(Boolean(session));
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const validatePassword = (currentPassword: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(currentPassword);
    const hasLowerCase = /[a-z]/.test(currentPassword);
    const hasNumbers = /\d/.test(currentPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(currentPassword);

    return (
      currentPassword.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast({
        title: 'Contraseña inválida',
        description: 'La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Asegurate de que ambas contraseñas sean iguales.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (!error) {
        toast({
          title: 'Contraseña restablecida',
          description: 'Tu contraseña se actualizó correctamente. Iniciá sesión con la nueva contraseña.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        await supabase.auth.signOut();
        router.push('/login');
      } else {
        throw new Error(error.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo restablecer la contraseña. El enlace puede estar vencido o ser inválido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <Center py={8}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
      </Center>
    );
  }

  if (!canReset) {
    return (
      <AuthCard
        badge="Recuperación"
        title="Se requiere enlace de recuperación"
        description="Abrí el enlace de recuperación que recibiste por correo para definir una nueva contraseña."
      >
        <Button colorScheme="teal" onClick={() => router.push('/login')}>
          Volver al inicio de sesión
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      badge="Recuperación"
      title="Definí una nueva contraseña"
      description="Creá una contraseña segura para proteger los datos y accesos de tu laboratorio."
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
            Restablecer credenciales
          </Text>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Nueva contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="new-password"
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

            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Confirmar nueva contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  {...inputStyles}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                    color={helperColor}
                    _hover={{ bg: 'blackAlpha.100' }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Text fontSize="sm" color={helperColor}>
              Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.
            </Text>

            <Button
              type="submit"
              colorScheme="teal"
              width="full"
              isLoading={isLoading}
              loadingText="Restableciendo"
            >
              Restablecer contraseña
            </Button>
          </VStack>
        </form>
      </VStack>
    </AuthCard>
  );
}

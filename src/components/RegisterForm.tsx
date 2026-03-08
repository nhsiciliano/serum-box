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
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthCard from '@/components/auth/AuthCard';

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
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

  const validatePassword = (currentPassword: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return regex.test(currentPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres e incluir letras, números y al menos un símbolo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      if (registerResponse.ok) {
        toast({
          title: 'Registro exitoso',
          description: 'Revisá tu correo y confirmá tu cuenta desde el enlace de Supabase.',
          status: 'success',
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
        title: 'Error',
        description: 'No se pudo completar el registro',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      badge="Registro"
      title="Creá tu cuenta"
      description="Configurá un acceso seguro a tu espacio de laboratorio y empezá a organizar muestras."
      footer={
        <Text textAlign="center" color={helperColor} fontSize="sm">
          ¿Ya tenés cuenta?{' '}
          <Button variant="link" color="teal.600" fontWeight="semibold" onClick={onSwitchToLogin}>
            Iniciar sesión
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
            Alta de identidad
          </Text>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Nombre o empresa</FormLabel>
              <Input
                type="text"
                placeholder="Michael Scott"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                {...inputStyles}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Correo electrónico</FormLabel>
              <Input
                type="email"
                placeholder="michaelscott@gmail.com"
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
                  placeholder="********"
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
              <FormLabel color={labelColor} fontSize="sm" fontWeight="semibold">Confirmar contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
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
              Usá al menos 6 caracteres con letras, números y un símbolo.
            </Text>

            <Button type="submit" colorScheme="teal" width="full" isLoading={isLoading} loadingText="Creando cuenta">
              Registrarme
            </Button>
          </VStack>
        </form>
      </VStack>
    </AuthCard>
  );
}

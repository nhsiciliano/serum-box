'use client';

import { useState } from 'react';
import LoginForm from '../../components/LoginForm';
import RegisterForm from '../../components/RegisterForm';
import { Box, Flex, Image } from '@chakra-ui/react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Flex width="100%" height="100vh">
      <Box width={{ base: "100%", md: "50%" }} margin="auto" p={8}>
        <Box maxWidth="400px" m="auto">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </Box>
      </Box>
      <Box 
        width={{ base: "0%", md: "50%" }} 
        height="100%" 
        display={{ base: "none", md: "block" }}
      >
        <Image 
          src="/login-image.jpg" 
          alt="Login background" 
          objectFit="cover" 
          width="100%" 
          height="100%"
        />
      </Box>
    </Flex>
  );
}

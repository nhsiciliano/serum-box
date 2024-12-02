'use client';

import { useState } from 'react';
import LoginForm from '../../components/LoginForm';
import RegisterForm from '../../components/RegisterForm';
import RecoverPassword from '../../components/RecoverPassword';
import { Box, Flex, Image } from '@chakra-ui/react';

export default function LoginPage() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'recover'>('login');

  const renderForm = () => {
    switch (currentView) {
      case 'register':
        return <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />;
      case 'recover':
        return <RecoverPassword onBackToLogin={() => setCurrentView('login')} />;
      default:
        return <LoginForm 
          onSwitchToRegister={() => setCurrentView('register')}
          onSwitchToRecover={() => setCurrentView('recover')}
        />;
    }
  };

  return (
    <Flex width="100%" height="100vh">
      <Box width={{ base: "100%", md: "50%" }} margin="auto" p={8}>
        <Box maxWidth="400px" m="auto">
          {renderForm()}
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

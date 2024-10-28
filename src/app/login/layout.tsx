import { Box } from '@chakra-ui/react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box 
      minHeight="100vh" 
      bg="white" // Mantenemos el fondo verde claro
    >
      {children}
    </Box>
  );
}

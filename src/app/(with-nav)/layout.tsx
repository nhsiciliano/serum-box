import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Box, Flex } from '@chakra-ui/react';

export default function LayoutWithNav({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" minHeight="100vh">
      <Navbar />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}

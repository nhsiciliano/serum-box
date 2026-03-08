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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <Box as="main" id="main-content" flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}

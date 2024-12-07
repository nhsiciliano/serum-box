'use client';

import { 
  Box, 
  Flex, 
  Button, 
  Image, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  useBreakpointValue,
  IconButton,
  Collapse
} from '@chakra-ui/react';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getButtonStyles = (isScrolled: boolean) => ({
    bg: isScrolled ? 'teal.500' : 'white',
    color: isScrolled ? 'white' : 'teal.500',
    _hover: {
      bg: isScrolled ? 'teal.600' : 'gray.100',
    }
  });

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      width="100%"
      zIndex={1000}
      transition="all 0.3s ease-in-out"
      bg={isScrolled ? 'rgba(154, 230, 180, 0.8)' : 'transparent'}
      backdropFilter={isScrolled ? 'blur(10px)' : 'none'}
      boxShadow={isScrolled ? 'md' : 'none'}
      css={{
        background: isScrolled
          ? 'rgba(154, 230, 180, 0.8)'
          : 'linear-gradient(to right, #4FD1C5, #9AE6B4)'
      }}
    >
      <Flex
        direction="row"
        py={2}
        h={isMobile ? '70px' : '80px'}
        alignItems="center"
        justifyContent="space-between"
        maxW="container.xl"
        mx="auto"
        px={4}
      >
        <Link href="/" passHref legacyBehavior>
          <Box 
            as="a" 
            display="flex" 
            alignItems="center"
            justifyContent="flex-start"
            width="auto"
          >
            <Image
              src="/images/serum-box.png"
              alt="Serum Box Logo"
              height="50px"
              width="auto"
              objectFit="contain"
              transition="filter 0.3s ease-in-out"
            />
          </Box>
        </Link>

        {isMobile ? (
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            color="white"
            size="lg"
          />
        ) : (
          <Flex alignItems="center" gap={4}>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                {...getButtonStyles(isScrolled)}
                variant="ghost"
                minW="70px"
              >
                {language === 'en' ? 'EN' : 'ES'}
              </MenuButton>
              <MenuList>
                <MenuItem color="teal.500" onClick={() => setLanguage('en')}>English</MenuItem>
                <MenuItem color="teal.500" onClick={() => setLanguage('es')}>Spanish</MenuItem>
              </MenuList>
            </Menu>

            <Link href="/login" passHref legacyBehavior>
              <Button
                as="a"
                {...getButtonStyles(isScrolled)}
                size="md"
                fontWeight="bold"
                px={6}
                rounded="md"
                minW="100px"
              >
                {translations[language as 'en' | 'es'].nav.start}
              </Button>
            </Link>
          </Flex>
        )}
      </Flex>

      {/* Menú móvil colapsable */}
      {isMobile && (
        <Collapse in={isOpen} animateOpacity>
          <Box
            p={4}
            bg="white"
            shadow="md"
          >
            <Flex
              direction="column"
              gap={4}
              align="center"
            >
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                  w="full"
                >
                  {language === 'en' ? 'EN' : 'ES'}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setLanguage('en')}>English</MenuItem>
                  <MenuItem onClick={() => setLanguage('es')}>Spanish</MenuItem>
                </MenuList>
              </Menu>

              <Link href="/login" passHref legacyBehavior>
                <Button
                  as="a"
                  colorScheme="teal"
                  w="full"
                >
                  {translations[language as 'en' | 'es'].nav.start}
                </Button>
              </Link>
            </Flex>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

'use client';

import { Box, Flex, Button, useColorMode, IconButton, Image, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getButtonStyles = (isScrolled: boolean, colorMode: string) => ({
    bg: isScrolled 
      ? (colorMode === 'light' ? 'teal.500' : 'teal.200') 
      : (colorMode === 'light' ? 'white' : 'gray.800'),
    color: isScrolled 
      ? (colorMode === 'light' ? 'white' : 'gray.800') 
      : (colorMode === 'light' ? 'teal.500' : 'teal.200'),
    _hover: {
      bg: isScrolled 
        ? (colorMode === 'light' ? 'teal.600' : 'teal.300')
        : (colorMode === 'light' ? 'gray.100' : 'gray.700'),
    }
  });

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      transition="all 0.3s ease-in-out"
      bg={isScrolled 
        ? (colorMode === 'light' ? 'rgba(154, 230, 180, 0.8)' : 'rgba(45, 55, 72, 0.8)') 
        : 'transparent'
      }
      backdropFilter={isScrolled ? 'blur(10px)' : 'none'}
      boxShadow={isScrolled ? 'md' : 'none'}
      css={{
        background: isScrolled
          ? (colorMode === 'light' ? 'rgba(154, 230, 180, 0.8)' : 'rgba(45, 55, 72, 0.8)')
          : (colorMode === 'light' 
              ? 'linear-gradient(to right, #4FD1C5, #9AE6B4)'
              : 'linear-gradient(to right, #2C7A7B, #276749)')
      }}
    >
      <Flex
        h={20}
        alignItems={'center'}
        justifyContent={'space-between'}
        maxW="container.xl"
        mx="auto"
        px={4}
      >
        <Link href="/" passHref legacyBehavior>
          <Box as="a" display="flex" alignItems="center">
            <Image
              src="/images/serum-box.png"
              alt="Serum Box Logo"
              height="50px"
              width="auto"
              objectFit="contain"
              filter={isScrolled && colorMode === 'dark' ? 'invert(1)' : 'none'}
              transition="filter 0.3s ease-in-out"
            />
          </Box>
        </Link>
        <Flex alignItems="center" gap={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="md"
            variant="ghost"
            color={isScrolled ? (colorMode === 'light' ? 'gray.800' : 'white') : 'white'}
          />
          
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              {...getButtonStyles(isScrolled, colorMode)}
              variant="ghost"
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
              {...getButtonStyles(isScrolled, colorMode)}
              size="md"
              fontWeight="bold"
              px={6}
              rounded="md"
            >
              {translations[language as 'en' | 'es'].nav.start}
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}

'use client';

import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/translations';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navText = useColorModeValue('#1b3039', '#e9f1f4');
  const navLine = useColorModeValue('rgba(16, 35, 43, 0.16)', 'rgba(236, 245, 248, 0.22)');
  const navBg = useColorModeValue(
    isScrolled ? 'rgba(248, 244, 236, 0.86)' : 'rgba(248, 244, 236, 0.45)',
    isScrolled ? 'rgba(20, 31, 38, 0.86)' : 'rgba(20, 31, 38, 0.5)'
  );
  const navBackdrop = useColorModeValue(
    isScrolled
      ? 'radial-gradient(120% 130% at 6% -30%, rgba(96, 191, 219, 0.16), transparent 62%), linear-gradient(120deg, rgba(250, 246, 240, 0.94), rgba(244, 238, 229, 0.9) 45%, rgba(248, 242, 235, 0.92))'
      : 'radial-gradient(120% 130% at 6% -30%, rgba(96, 191, 219, 0.2), transparent 62%), linear-gradient(120deg, rgba(250, 246, 240, 0.72), rgba(244, 238, 229, 0.62) 45%, rgba(248, 242, 235, 0.68))',
    isScrolled
      ? 'radial-gradient(120% 130% at 6% -30%, rgba(104, 194, 221, 0.15), transparent 62%), linear-gradient(120deg, rgba(25, 38, 45, 0.94), rgba(20, 31, 38, 0.9) 45%, rgba(17, 28, 35, 0.92))'
      : 'radial-gradient(120% 130% at 6% -30%, rgba(104, 194, 221, 0.18), transparent 62%), linear-gradient(120deg, rgba(25, 38, 45, 0.72), rgba(20, 31, 38, 0.62) 45%, rgba(17, 28, 35, 0.68))'
  );
  const surface = useColorModeValue('#fcfaf5', '#1a2931');
  const hoverBg = useColorModeValue('rgba(20, 90, 113, 0.1)', 'rgba(143, 216, 239, 0.18)');
  const ctaBg = useColorModeValue('#145a71', '#89d4ec');
  const ctaText = useColorModeValue('#ffffff', '#12303c');

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      transition="all 0.3s ease"
      bg={navBg}
      backgroundImage={navBackdrop}
      borderBottom="1px solid"
      borderColor={navLine}
      backdropFilter="blur(14px)"
      boxShadow={isScrolled ? '0 10px 34px rgba(10, 24, 31, 0.12)' : 'none'}
    >
      <Flex
        h={{ base: '72px', md: '82px' }}
        align="center"
        justify="space-between"
        maxW="container.xl"
        mx="auto"
        px={{ base: 4, md: 5 }}
      >
        <Link href="/" passHref legacyBehavior>
          <Box as="a" display="inline-flex" alignItems="center" minW="120px">
            <NextImage
              src="/images/serum-box.png"
              alt="Serum Box Logo"
              width={174}
              height={48}
              priority
              style={{ width: 'auto', height: '48px', objectFit: 'contain' }}
            />
          </Box>
        </Link>

        {isMobile ? (
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon boxSize={5} />}
            onClick={() => setIsOpen((prev) => !prev)}
            variant="ghost"
            color={navText}
            _hover={{ bg: hoverBg }}
            size="md"
          />
        ) : (
          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                color={navText}
                border="1px solid"
                borderColor={navLine}
                bg={surface}
                _hover={{ bg: hoverBg }}
                minW="78px"
                rounded="full"
              >
                {language === 'en' ? 'EN' : 'ES'}
              </MenuButton>
              <MenuList borderColor={navLine} bg={surface}>
                <MenuItem color={navText} onClick={() => setLanguage('en')}>
                  English
                </MenuItem>
                <MenuItem color={navText} onClick={() => setLanguage('es')}>
                  Spanish
                </MenuItem>
              </MenuList>
            </Menu>

            <Link href="/login" passHref legacyBehavior>
              <Button
                as="a"
                rounded="full"
                px={6}
                bg={ctaBg}
                color={ctaText}
                fontWeight="700"
                _hover={{ transform: 'translateY(-1px)', filter: 'brightness(0.94)' }}
                transition="all 0.2s ease"
              >
                {translations[language as 'en' | 'es'].nav.start}
              </Button>
            </Link>
          </HStack>
        )}
      </Flex>

      {isMobile && (
        <Collapse in={isOpen} animateOpacity>
          <Box px={4} pb={4}>
            <Box
              p={4}
              rounded="2xl"
              border="1px solid"
              borderColor={navLine}
              bg={surface}
              boxShadow="0 16px 40px rgba(10, 24, 31, 0.16)"
            >
              <Flex direction="column" gap={3}>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    variant="ghost"
                    justifyContent="space-between"
                    color={navText}
                    border="1px solid"
                    borderColor={navLine}
                    bg="transparent"
                    _hover={{ bg: hoverBg }}
                  >
                    {language === 'en' ? 'EN' : 'ES'}
                  </MenuButton>
                  <MenuList borderColor={navLine} bg={surface}>
                    <MenuItem color={navText} onClick={() => setLanguage('en')}>
                      English
                    </MenuItem>
                    <MenuItem color={navText} onClick={() => setLanguage('es')}>
                      Spanish
                    </MenuItem>
                  </MenuList>
                </Menu>

                <Link href="/login" passHref legacyBehavior>
                  <Button as="a" rounded="full" bg={ctaBg} color={ctaText} fontWeight="700" w="full">
                    {translations[language as 'en' | 'es'].nav.start}
                  </Button>
                </Link>
              </Flex>
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

'use client';

import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { translations } from '@/lib/translations';

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];
  const toast = useToast();

  const bg = useColorModeValue('#0d1a21', '#091116');
  const text = useColorModeValue('rgba(233, 243, 247, 0.9)', 'rgba(230, 240, 245, 0.9)');
  const muted = useColorModeValue('rgba(206, 221, 227, 0.78)', 'rgba(193, 211, 217, 0.8)');
  const line = useColorModeValue('rgba(146, 213, 235, 0.32)', 'rgba(146, 213, 235, 0.24)');
  const surface = useColorModeValue('rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.02)');
  const fieldBg = useColorModeValue('rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.04)');
  const accent = useColorModeValue('#8bd7ee', '#97ddf2');
  const fieldHover = useColorModeValue('rgba(139, 215, 238, 0.18)', 'rgba(151, 221, 242, 0.2)');
  const iconHover = useColorModeValue('rgba(151, 221, 242, 0.24)', 'rgba(151, 221, 242, 0.2)');
  const footerBackdrop = useColorModeValue(
    'radial-gradient(72% 58% at 4% 6%, rgba(104, 189, 218, 0.22), transparent 68%), radial-gradient(56% 46% at 92% 12%, rgba(240, 177, 105, 0.2), transparent 70%), linear-gradient(170deg, #0d1a21 0%, #102532 46%, #0a161c 100%)',
    'radial-gradient(72% 58% at 4% 6%, rgba(104, 189, 218, 0.18), transparent 68%), radial-gradient(56% 46% at 92% 12%, rgba(240, 177, 105, 0.14), transparent 70%), linear-gradient(170deg, #091116 0%, #0c1d26 46%, #070e12 100%)'
  );
  const revealRef = useScrollReveal();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: t.footer.contact.successTitle || 'Message Sent',
          description: t.footer.contact.successMessage || 'Your message has been sent successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      toast({
        title: t.footer.contact.errorTitle || 'Error',
        description: t.footer.contact.errorMessage || 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      as="footer"
      bg={bg}
      color={text}
      py={{ base: 14, md: 16 }}
      borderTop="1px solid"
      borderColor={line}
      backgroundImage={footerBackdrop}
    >
      <Container maxW="container.xl">
        <Grid ref={revealRef} templateColumns={{ base: '1fr', lg: '1.2fr 0.8fr' }} gap={{ base: 10, lg: 12 }}>
          <GridItem>
            <VStack align="start" spacing={5}>
              <Text data-reveal textTransform="uppercase" letterSpacing="0.12em" fontSize="xs" fontWeight="800" color={accent}>
                {language === 'es' ? 'Contacto' : 'Contact'}
              </Text>
              <Heading data-reveal as="h3" size="xl" fontWeight="500" color="white" lineHeight="1.1">
                {t.footer.contact.title}
              </Heading>
              <Text data-reveal color={muted} maxW="54ch" lineHeight="1.75">
                {t.footer.contact.description}
              </Text>

              <Box
                data-reveal
                as="form"
                onSubmit={handleSubmit}
                w="full"
                p={{ base: 4, md: 5 }}
                borderRadius="20px"
                border="1px solid"
                borderColor={line}
                bg={surface}
                backdropFilter="blur(8px)"
              >
                <VStack spacing={4} align="stretch">
                  <Input
                    placeholder={t.footer.contact.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    bg={fieldBg}
                    border="1px solid"
                    borderColor={line}
                    color={text}
                    _placeholder={{ color: muted }}
                    _hover={{ borderColor: fieldHover }}
                    _focusVisible={{ borderColor: accent, boxShadow: `0 0 0 1px ${accent}` }}
                    required
                  />
                  <Input
                    placeholder={t.footer.contact.email}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={fieldBg}
                    border="1px solid"
                    borderColor={line}
                    color={text}
                    _placeholder={{ color: muted }}
                    _hover={{ borderColor: fieldHover }}
                    _focusVisible={{ borderColor: accent, boxShadow: `0 0 0 1px ${accent}` }}
                    required
                  />
                  <Textarea
                    placeholder={t.footer.contact.message}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    bg={fieldBg}
                    border="1px solid"
                    borderColor={line}
                    color={text}
                    _placeholder={{ color: muted }}
                    _hover={{ borderColor: fieldHover }}
                    _focusVisible={{ borderColor: accent, boxShadow: `0 0 0 1px ${accent}` }}
                    minH="136px"
                    required
                  />
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    rounded="full"
                    bg={accent}
                    color="#12303c"
                    fontWeight="800"
                    alignSelf="start"
                    px={8}
                    _hover={{ filter: 'brightness(0.95)' }}
                  >
                    {t.footer.contact.send}
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={5}>
              <Text data-reveal textTransform="uppercase" letterSpacing="0.12em" fontSize="xs" fontWeight="800" color={accent}>
                Serum Box
              </Text>
              <Heading data-reveal as="h3" size="xl" fontWeight="500" color="white" lineHeight="1.1">
                {t.footer.about.title}
              </Heading>
              <Text data-reveal color={muted} lineHeight="1.8">
                {t.footer.about.description}
              </Text>

              <HStack data-reveal spacing={3} pt={2}>
                <IconButton
                  as="a"
                  href="https://www.instagram.com/serumbox.lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  icon={<FaInstagram size="20px" />}
                  borderRadius="full"
                  variant="ghost"
                  color={text}
                  border="1px solid"
                  borderColor={line}
                  _hover={{ bg: iconHover, borderColor: accent, color: accent }}
                />
                <IconButton
                  as="a"
                  href="https://www.facebook.com/61578118567393"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  icon={<FaFacebook size="20px" />}
                  borderRadius="full"
                  variant="ghost"
                  color={text}
                  border="1px solid"
                  borderColor={line}
                  _hover={{ bg: iconHover, borderColor: accent, color: accent }}
                />
                <IconButton
                  as="a"
                  href="https://www.linkedin.com/company/serum-box"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  icon={<FaLinkedin size="20px" />}
                  borderRadius="full"
                  variant="ghost"
                  color={text}
                  border="1px solid"
                  borderColor={line}
                  _hover={{ bg: iconHover, borderColor: accent, color: accent }}
                />
              </HStack>
            </VStack>
          </GridItem>
        </Grid>

        <Box mt={{ base: 12, md: 14 }} pt={6} borderTop="1px solid" borderColor={line}>
          <Text color={muted} textAlign="center" fontSize="sm">
            &copy; {new Date().getFullYear()} Serum Box. {t.footer.about.rights}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}

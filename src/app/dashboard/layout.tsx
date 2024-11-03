"use client"

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Flex, VStack, Icon, Link, ChakraProvider, extendTheme, Image, useToast, IconButton } from '@chakra-ui/react';
import { FiHome, FiDatabase, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';
import NextLink from 'next/link';
import { IconType } from 'react-icons';
import DashboardHeader from '@/components/DashboardHeader';

// Definimos un tema personalizado
const theme = extendTheme({
    colors: {
        brand: {
            100: "#e0fff4",
            200: "#c2ffe7",
            500: "#00a86b",
        },
    },
});

const NavItem = ({ icon, children, href, onClick }: { icon: IconType; children: string; href?: string; onClick?: () => void }) => (
    <Link 
        as={href ? NextLink : 'button'}
        href={href} 
        onClick={onClick}
        style={{ textDecoration: 'none' }} 
        _focus={{ boxShadow: 'none' }}
    >
        <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            color="black"
            _hover={{
                bg: 'brand.200',
                color: 'brand.500',
            }}
        >
            {icon && (
                <Icon
                    mr="4"
                    fontSize="18"
                    color="black"
                    _groupHover={{
                        color: 'brand.500',
                    }}
                    as={icon}
                />
            )}
            {children}
        </Flex>
    </Link>
);

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            router.push('/');
            toast({
                title: "Signed out",
                description: "You have successfully signed out.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: "There was a problem signing out. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error('Error signing out:', error);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        return null;
    }

    return (
        <ChakraProvider theme={theme}>
            <Flex h="100vh" bg="white" overflow="hidden">
                {/* Mobile menu button */}
                <IconButton
                    aria-label="Open menu"
                    icon={<FiMenu />}
                    onClick={toggleMenu}
                    display={{ base: "flex", md: "none" }}
                    position="fixed"
                    top={4}
                    right={4}
                    zIndex={20}
                />

                {/* Sidebar */}
                <Box 
                    w={{ base: "full", md: "250px" }} 
                    bg="brand.200" 
                    position="fixed"
                    h="100vh"
                    left={0}
                    top={0}
                    zIndex={15}
                    transform={{ base: isMenuOpen ? "translateX(0)" : "translateX(-100%)", md: "translateX(0)" }}
                    transition="transform 0.3s"
                    overflowY="auto"
                >
                    <VStack spacing={6} align="stretch" p={5}>
                        <Flex align="center" mb={5}>
                            <Image
                                src="/images/serum-box.png"
                                alt="SerumBox Logo"
                                height="40px"
                                width="auto"
                                objectFit="contain"
                                mr={3}
                            />
                        </Flex>
                        <NavItem icon={FiHome} href="/dashboard">Home</NavItem>
                        <NavItem icon={FiDatabase} href="/dashboard/create-grilla">Create Grid</NavItem>
                        <NavItem icon={FiSettings} href="/dashboard/admin-cuenta">Manage Account</NavItem>
                        <NavItem icon={FiLogOut} onClick={handleSignOut}>Sign Out</NavItem>
                    </VStack>
                </Box>

                {/* Main content */}
                <Box 
                    flex={1}
                    ml={{ base: 0, md: "250px" }}
                    position="relative"
                    h="100vh"
                    overflowY="auto"
                >
                    <Box p={8} bg="gray.50" minH="100%">
                        <DashboardHeader />
                        {children}
                    </Box>
                </Box>
            </Flex>
        </ChakraProvider>
    );
}

import { Flex, Text, Avatar, Menu, MenuButton, MenuList, MenuItem, Spinner, IconButton, HStack, Link, Box, VStack, MenuDivider } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FiHome, FiSettings, FiUsers, FiUserCheck, FiLogOut } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { UserManagement } from './UserManagement';
import { CurrentUserSelector } from './CurrentUserSelector';

export default function DashboardHeader() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [isCurrentUserSelectorOpen, setIsCurrentUserSelectorOpen] = useState(false);
    const [activeUser, setActiveUser] = useState<string>('');
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() => {
        const updateActiveUser = () => {
            const storedUserId = localStorage.getItem('currentUserId');
            const storedUserName = localStorage.getItem('currentUserName');
            
            if (storedUserId && storedUserName && storedUserId !== session?.user?.id) {
                setActiveUser(storedUserName);
            } else {
                setActiveUser(session?.user?.name || '');
            }
        };

        window.addEventListener('userChanged', updateActiveUser);
        updateActiveUser();

        return () => window.removeEventListener('userChanged', updateActiveUser);
    }, [session]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut({ redirect: false });
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <>
            <Flex
                justify="space-between"
                align="center"
                mb={6}
                p={4}
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
            >
                <Flex direction="column" gap={1}>
                    <Text fontSize="xl" color="gray.700">
                        Hello, {session?.user?.name || 'User'}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Active User: {activeUser}
                    </Text>
                </Flex>
                <HStack spacing={4}>
                    <Link as={NextLink} href="/dashboard">
                        <IconButton
                            aria-label="Home"
                            icon={<FiHome />}
                            variant="ghost"
                            color="gray.600"
                            fontSize="22px"
                        />
                    </Link>
                    <Menu>
                        <MenuButton>
                        <Avatar
                            size="md"
                            src={session?.user?.image || '/images/default-avatar.png'}
                            cursor="pointer"
                        />
                    </MenuButton>
                    <MenuList borderRadius="lg" boxShadow="lg" p={2} bg="white">
                        <Box px={3} py={2}>
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" color="gray.800">
                                    {session?.user?.name || 'User'}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    {session?.user?.email}
                                </Text>
                            </VStack>
                        </Box>
                        <MenuDivider />
                        <MenuItem
                            icon={<FiSettings />}
                            onClick={() => router.push('/dashboard/admin-cuenta')}
                            borderRadius="md"
                            color="gray.700"
                        >
                            Manage Account
                        </MenuItem>
                        <MenuItem
                            icon={<FiUserCheck />}
                            onClick={() => setIsCurrentUserSelectorOpen(true)}
                            borderRadius="md"
                            color="gray.700"
                        >
                            Select Current User
                        </MenuItem>
                        {session?.user?.isMainUser && (
                            <MenuItem
                                icon={<FiUsers />}
                                onClick={() => setIsUserManagementOpen(true)}
                                borderRadius="md"
                                color="gray.700"
                            >
                                Users Management
                            </MenuItem>
                        )}
                        <MenuDivider />
                        <MenuItem
                            icon={<FiLogOut />}
                            onClick={handleSignOut}
                            isDisabled={isSigningOut}
                            color="red.500"
                            _hover={{ bg: 'red.50', color: 'red.600' }}
                            borderRadius="md"
                        >
                            {isSigningOut ? (
                                <Flex align="center">
                                    <Spinner size="sm" mr={2} />
                                    Signing out...
                                </Flex>
                            ) : (
                                'Sign Out'
                            )}
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
            </Flex>

            <UserManagement 
                isOpen={isUserManagementOpen} 
                onClose={() => setIsUserManagementOpen(false)} 
            />
            <CurrentUserSelector
                isOpen={isCurrentUserSelectorOpen}
                onClose={() => setIsCurrentUserSelectorOpen(false)}
            />
        </>
    );
}

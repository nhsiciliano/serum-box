import { Flex, Text, Avatar, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
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
        await signOut({ redirect: false });
        router.push('/');
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
                <Menu>
                    <MenuButton>
                        <Avatar
                            size="md"
                            src={session?.user?.image || '/images/default-avatar.png'}
                            cursor="pointer"
                        />
                    </MenuButton>
                    <MenuList>
                        <MenuItem 
                            color="gray.700"
                            onClick={() => setIsCurrentUserSelectorOpen(true)}
                        >
                            Select Current User
                        </MenuItem>
                        {session?.user?.isMainUser && (
                            <MenuItem
                                color="gray.700"
                                onClick={() => setIsUserManagementOpen(true)}
                            >
                                Users Management
                            </MenuItem>
                        )}
                        <MenuItem color="gray.700">Change profile picture</MenuItem>
                        <MenuItem 
                            color="gray.700"
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </MenuItem>
                    </MenuList>
                </Menu>
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

import { Flex, Text, Avatar, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    return (
        <Flex
            justify="space-between"
            align="center"
            mb={6}
            p={4}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
        >
            <Text fontSize="xl" color="gray.700">
                Hello, {session?.user?.name || 'User'}
            </Text>
            <Menu>
                <MenuButton>
                    <Avatar
                        size="md"
                        src={session?.user?.image || '/images/default-avatar.png'}
                        cursor="pointer"
                    />
                </MenuButton>
                <MenuList>
                    <MenuItem color="gray.700">Change profile picture</MenuItem>
                    <MenuItem 
                        color="gray.700" 
                        onClick={() => router.push('/dashboard/admin-cuenta')}
                    >
                        Manage Account
                    </MenuItem>
                    <MenuItem 
                        color="gray.700"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    );
}

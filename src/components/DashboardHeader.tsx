import { Flex, Text, Avatar, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

export default function DashboardHeader() {
    const { data: session } = useSession();

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
                Hola, {session?.user?.name || 'Usuario'}
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
                    <MenuItem color="gray.700">Cambiar foto de perfil</MenuItem>
                    <MenuItem color="gray.700">Configuración</MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    );
}

import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiHome, FiLogOut, FiSettings, FiUserCheck, FiUsers } from 'react-icons/fi';
import { CurrentUserSelector } from './CurrentUserSelector';
import { UserManagement } from './UserManagement';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Resumen operativo',
  '/dashboard/create-grilla': 'Crear gradilla',
  '/dashboard/inventory': 'Control de inventario',
  '/dashboard/audit-log': 'Auditoría de acciones',
  '/dashboard/admin-cuenta': 'Configuración de cuenta',
};

export default function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isCurrentUserSelectorOpen, setIsCurrentUserSelectorOpen] = useState(false);
  const [activeUser, setActiveUser] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const headingColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const menuItemColor = useColorModeValue('gray.800', 'gray.100');
  const menuItemHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');

  const currentPageTitle = useMemo(() => {
    if (pathname.startsWith('/dashboard/gradilla/')) {
      return 'Detalle de gradilla';
    }
    return pageTitles[pathname] || 'Panel';
  }, [pathname]);

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
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 3 }}
        p={{ base: 4, md: 5 }}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        boxShadow="0 10px 30px rgba(15, 23, 42, 0.05)"
      >
        <VStack align="flex-start" spacing={1}>
          <Text fontSize="xs" letterSpacing="0.11em" textTransform="uppercase" color={mutedColor} fontWeight="semibold">
            Espacio de laboratorio
          </Text>
          <Text fontSize={{ base: 'xl', md: '2xl' }} color={headingColor} fontWeight="semibold">
            {currentPageTitle}
          </Text>
          <HStack spacing={2}>
            <Text color={mutedColor} fontSize="sm">
              Usuario activo:
            </Text>
            <Badge colorScheme="teal" borderRadius="full" px={2.5} py={1}>
              {activeUser || session?.user?.name || 'Usuario'}
            </Badge>
          </HStack>
        </VStack>

        <HStack spacing={3} w={{ base: 'full', md: 'auto' }} justify={{ base: 'space-between', md: 'flex-end' }}>
          <Button
            leftIcon={<FiHome />}
            variant="outline"
            borderColor={borderColor}
            onClick={() => router.push('/dashboard')}
          >
            Inicio
          </Button>

          <Menu>
            <MenuButton>
              <Avatar
                size="md"
                src={session?.user?.image || '/images/default-avatar.png'}
                cursor="pointer"
              />
            </MenuButton>
            <MenuList borderRadius="xl" boxShadow="xl" p={2} bg={cardBg} border="1px solid" borderColor={borderColor}>
              <Box px={3} py={2}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" color={headingColor}>
                    {session?.user?.name || 'Usuario'}
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    {session?.user?.email}
                  </Text>
                </VStack>
              </Box>
              <MenuDivider />
              <MenuItem
                icon={<FiSettings />}
                onClick={() => router.push('/dashboard/admin-cuenta')}
                borderRadius="md"
                color={menuItemColor}
                _hover={{ bg: menuItemHoverBg }}
                _focus={{ bg: menuItemHoverBg }}
              >
                Gestionar cuenta
              </MenuItem>
              <MenuItem
                icon={<FiUserCheck />}
                onClick={() => setIsCurrentUserSelectorOpen(true)}
                borderRadius="md"
                color={menuItemColor}
                _hover={{ bg: menuItemHoverBg }}
                _focus={{ bg: menuItemHoverBg }}
              >
                Seleccionar usuario activo
              </MenuItem>
              {session?.user?.isMainUser && (
                <MenuItem
                  icon={<FiUsers />}
                  onClick={() => setIsUserManagementOpen(true)}
                  borderRadius="md"
                  color={menuItemColor}
                  _hover={{ bg: menuItemHoverBg }}
                  _focus={{ bg: menuItemHoverBg }}
                >
                  Gestión de usuarios
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
                    Cerrando sesión...
                  </Flex>
                ) : (
                  'Cerrar sesión'
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

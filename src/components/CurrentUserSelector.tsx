import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Text,
    useToast,
    Center,
    Spinner,
    Box,
    HStack,
    Avatar,
    Badge,
    Icon
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useActiveUser } from '../hooks/useActiveUser';
import { useFetchWithAuth } from '../hooks/useFetchWithAuth';

interface User {
    id: string;
    name: string;
    email: string;
}

interface CurrentUserSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CurrentUserSelector = ({ isOpen, onClose }: CurrentUserSelectorProps) => {
    const { data: session } = useSession();
    const { setActiveUserId } = useActiveUser();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const toast = useToast();
    const { fetchWithAuth } = useFetchWithAuth();
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        if (!session?.user?.id || !isOpen) return;
        
        setIsLoading(true);
        try {
            const secondaryUsers = await fetchWithAuth('/api/users/secondary');
            const allUsers = [
                {
                    id: session.user.id,
                    name: session.user.name || 'Main User',
                    email: session.user.email || ''
                },
                ...secondaryUsers
            ];
            setUsers(allUsers);
            
            const currentUserId = localStorage.getItem('currentUserId');
            const userExists = allUsers.some(user => user.id === currentUserId);
            
            setSelectedUserId(userExists ? currentUserId || session.user.id : session.user.id);
            
            if (!userExists && currentUserId) {
                setActiveUserId(session.user.id);
                localStorage.setItem('currentUserId', session.user.id);
                localStorage.setItem('currentUserName', session.user.name || '');
                window.dispatchEvent(new Event('userChanged'));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id, session?.user?.name, session?.user?.email, fetchWithAuth, isOpen, setActiveUserId]);

    // Actualizar cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setUsers([]); // Resetear la lista para forzar una nueva carga
            fetchUsers();
        }
    }, [isOpen, fetchUsers]);

    // Escuchar eventos de cambios en usuarios secundarios
    useEffect(() => {
        const handleUserChange = () => {
            setUsers([]); // Resetear la lista para forzar una nueva carga
            fetchUsers();
        };

        window.addEventListener('secondaryUsersChanged', handleUserChange);
        return () => window.removeEventListener('secondaryUsersChanged', handleUserChange);
    }, [fetchUsers]);

    const handleUserChange = (userId: string) => {
        if (!userId) return;
        
        const selectedUser = users.find(user => user.id === userId);
        setSelectedUserId(userId);
        setActiveUserId(userId);
        
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('currentUserName', selectedUser?.name || selectedUser?.email || '');
        
        // Forzar actualización del header
        window.dispatchEvent(new Event('userChanged'));
        
        toast({
            title: "User changed",
            description: `Now you are operating as: ${selectedUser?.name}`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
        
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent borderRadius="xl">
                <ModalHeader color="gray.700" fontWeight="bold">Switch Active User</ModalHeader>
                <ModalCloseButton color="gray.700"/>
                <ModalBody pb={6}>
                    {isLoading ? (
                        <Center py={8}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="brand.500" thickness="4px" />
                                <Text color="gray.500" fontWeight="medium">Loading Users...</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <VStack align="stretch" spacing={3}>
                            {users.map(user => {
                                const isSelected = user.id === selectedUserId;
                                return (
                                    <Box
                                        key={user.id}
                                        p={4}
                                        borderWidth="2px"
                                        borderRadius="lg"
                                        onClick={() => handleUserChange(user.id)}
                                        cursor="pointer"
                                        borderColor={isSelected ? 'brand.500' : 'gray.200'}
                                        bg={isSelected ? 'brand.50' : 'white'}
                                        _hover={!isSelected ? { borderColor: 'gray.300', bg: 'gray.50' } : {}}
                                        transition="all 0.2s ease-in-out"
                                        position="relative"
                                    >
                                        <HStack spacing={4}>
                                            <Avatar name={user.name} size="md" />
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="bold" color="gray.800">{user.name}</Text>
                                                <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                            </VStack>
                                        </HStack>
                                        {user.id === session?.user?.id && (
                                            <Badge
                                                position="absolute"
                                                top={3}
                                                right={3}
                                                colorScheme="green"
                                                variant="subtle"
                                            >
                                                Main User
                                            </Badge>
                                        )}
                                        {isSelected && (
                                            <Icon
                                                as={FiCheckCircle}
                                                color="brand.500"
                                                position="absolute"
                                                bottom={3}
                                                right={3}
                                                w={6}
                                                h={6}
                                            />
                                        )}
                                    </Box>
                                );
                            })}
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
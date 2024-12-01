import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Radio,
    RadioGroup,
    Text,
    useToast,
    Center,
    Spinner
} from '@chakra-ui/react';
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
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="blue.500">Select Active User</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {isLoading ? (
                        <Center py={8}>
                            <VStack spacing={4}>
                                <Spinner size="xl" color="blue.500" />
                                <Text color="gray.600">Loading Users...</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <RadioGroup onChange={handleUserChange} value={selectedUserId}>
                            <VStack align="start" spacing={4}>
                                {users.map(user => (
                                    <Radio key={user.id} value={user.id}>
                                        <Text color="gray.700">
                                            {user.name} ({user.email})
                                            {user.id === session?.user?.id && " (Main User)"}
                                        </Text>
                                    </Radio>
                                ))}
                            </VStack>
                        </RadioGroup>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
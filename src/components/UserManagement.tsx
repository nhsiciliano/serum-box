import { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Input,
    FormControl,
    FormLabel,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Spinner,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useFetchWithAuth } from '../hooks/useFetchWithAuth';

interface SecondaryUser {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export const UserManagement = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [secondaryUsers, setSecondaryUsers] = useState<SecondaryUser[]>([]);
    const toast = useToast();
    const { fetchWithAuth } = useFetchWithAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const fetchSecondaryUsers = useCallback(async () => {
        try {
            const data = await fetchWithAuth('/api/users/secondary');
            setSecondaryUsers(data);
        } catch (error) {
            console.error('Error fetching secondary users:', error);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchSecondaryUsers();
    }, [fetchSecondaryUsers]);


    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (secondaryUsers.length >= 4) {
            toast({
                title: "Limit reached",
                description: "You cannot add more than 4 secondary users",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsAdding(true);
        try {
            await fetchWithAuth('/api/users/secondary', {
                method: 'POST',
                body: JSON.stringify({ email, name })
            });

            toast({
                title: "User added",
                description: "User added successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setEmail('');
            setName('');
            fetchSecondaryUsers();
            window.dispatchEvent(new Event('secondaryUsersChanged'));
        } catch (error) {
            console.error('Error adding secondary user:', error);
            toast({
                title: "Error",
                description: "Could not add the user",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setDeletingUserId(userId);
        try {
            await fetchWithAuth(`/api/users/secondary/${userId}`, {
                method: 'DELETE'
            });

            toast({
                title: "User deleted",
                description: "The secondary user has been deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            fetchSecondaryUsers();
            window.dispatchEvent(new Event('secondaryUsersChanged'));
        } catch (error) {
            console.error('Error deleting secondary user:', error);
            toast({
                title: "Error",
                description: "Could not delete the user",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeletingUserId(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="blue.500">Users Management</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} as="form" onSubmit={handleAddUser}>
                        <FormControl>
                            <FormLabel color="gray.700">Name</FormLabel>
                            <Input 
                                value={name}
                                color="gray.700"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name of the user"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color="gray.700">Email</FormLabel>
                            <Input 
                                value={email}
                                color="gray.700"
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                type="email"
                            />
                        </FormControl>
                        <Button 
                            colorScheme="blue" 
                            type="submit"
                            isLoading={isAdding}
                            loadingText="Adding"
                            spinner={<Spinner />}
                        >
                            Add User
                        </Button>

                        <Table variant="simple" mt={6}>
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Email</Th>
                                    <Th>Creation Date</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {secondaryUsers.map(user => (
                                    <Tr key={user.id}>
                                        <Td color="gray.700">{user.name}</Td>
                                        <Td color="gray.700">{user.email}</Td>
                                        <Td color="gray.700">{new Date(user.createdAt).toLocaleDateString()}</Td>
                                        <Td>
                                            <IconButton
                                                aria-label="Delete user"
                                                icon={<DeleteIcon />}
                                                colorScheme="red"
                                                onClick={() => handleDeleteUser(user.id)}
                                                isLoading={deletingUserId === user.id}
                                                spinner={<Spinner />}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

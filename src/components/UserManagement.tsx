import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    Button, VStack, Input, FormControl, FormLabel, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
    Box, HStack, InputGroup, InputLeftElement, TableContainer, useDisclosure, Text, Avatar, Heading, Center, Icon, Skeleton
} from '@chakra-ui/react';
import {
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import { FiPlus, FiUser, FiMail, FiTrash2, FiUsers } from 'react-icons/fi';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const [userToDelete, setUserToDelete] = useState<SecondaryUser | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    const fetchSecondaryUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchWithAuth('/api/users/secondary');
            setSecondaryUsers(data);
        } catch (error) {
            console.error('Error fetching secondary users:', error);
            toast({
                title: 'Error fetching users',
                description: 'Could not load the list of secondary users.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithAuth, toast]);

    useEffect(() => {
        if (isOpen) {
            fetchSecondaryUsers();
        }
    }, [isOpen, fetchSecondaryUsers]);


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

    const handleDeleteClick = (user: SecondaryUser) => {
        setUserToDelete(user);
        onAlertOpen();
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        setDeletingUserId(userToDelete.id);
        try {
            await fetchWithAuth(`/api/users/secondary/${userToDelete.id}`, {
                method: 'DELETE'
            });

            toast({
                title: 'User deleted',
                description: `The user ${userToDelete.name} has been successfully removed.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            fetchSecondaryUsers();
            window.dispatchEvent(new Event('secondaryUsersChanged'));
        } catch (error) {
            console.error('Error deleting secondary user:', error);
            toast({
                title: 'Deletion Error',
                description: 'Could not delete the user. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeletingUserId(null);
            onAlertClose();
            setUserToDelete(null);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader color="gray.700" fontWeight="bold">Manage Users</ModalHeader>
                    <ModalCloseButton color="gray.700"/>
                    <ModalBody p={6}>
                        <VStack spacing={6} align="stretch">
                            <Box p={5} borderWidth="1px" borderRadius="lg" borderColor="gray.200">
                                <Heading as="h3" size="md" mb={4} color="gray.600">Add New User</Heading>
                                <HStack as="form" onSubmit={handleAddUser} spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel htmlFor='name' srOnly>Name</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents='none'>
                                                <Icon as={FiUser} color='gray.400' />
                                            </InputLeftElement>
                                            <Input 
                                                id='name'
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="User's Name"
                                                focusBorderColor="brand.500"
                                                color="gray.600"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel htmlFor='email' srOnly>Email</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents='none'>
                                                <Icon as={FiMail} color='gray.400' />
                                            </InputLeftElement>
                                            <Input 
                                                id='email'
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="email@example.com"
                                                type="email"
                                                focusBorderColor="brand.500"
                                                color="gray.600"
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <Button 
                                        leftIcon={<FiPlus />}
                                        colorScheme="brand"
                                        type="submit"
                                        isLoading={isAdding}
                                        loadingText="Adding..."
                                        px={8}
                                    >
                                        Add
                                    </Button>
                                </HStack>
                            </Box>

                            <TableContainer>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User</Th>
                                            <Th>Creation Date</Th>
                                            <Th isNumeric>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {isLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <Tr key={i}>
                                                    <Td><Skeleton height='40px' /></Td>
                                                    <Td><Skeleton height='20px' /></Td>
                                                    <Td isNumeric><Skeleton height='40px' width='40px' /></Td>
                                                </Tr>
                                            ))
                                        ) : secondaryUsers.length === 0 ? (
                                            <Tr>
                                                <Td colSpan={3}>
                                                    <Center p={8} flexDirection="column">
                                                        <Icon as={FiUsers} w={12} h={12} color="gray.300" />
                                                        <Text mt={4} fontWeight="medium" color="gray.500">No secondary users yet.</Text>
                                                        <Text fontSize="sm" color="gray.400">Use the form above to add one.</Text>
                                                    </Center>
                                                </Td>
                                            </Tr>
                                        ) : (
                                            secondaryUsers.map(user => (
                                                <Tr key={user.id}>
                                                    <Td>
                                                        <HStack spacing={3}>
                                                            <Avatar name={user.name} size="sm" />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="medium" color="gray.800">{user.name}</Text>
                                                                <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Td>
                                                    <Td color="gray.600">{new Date(user.createdAt).toLocaleDateString()}</Td>
                                                    <Td isNumeric>
                                                        <IconButton
                                                            aria-label="Delete user"
                                                            icon={<FiTrash2 />}
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() => handleDeleteClick(user)}
                                                            isLoading={deletingUserId === user.id}
                                                        />
                                                    </Td>
                                                </Tr>
                                            ))
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete User
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete <Text as="span" fontWeight="bold">{userToDelete?.name}</Text>?
                            This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={confirmDeleteUser} ml={3} isLoading={!!deletingUserId}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

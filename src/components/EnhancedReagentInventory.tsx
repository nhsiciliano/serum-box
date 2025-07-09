import React, { useState, useEffect, useCallback } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';
import {
  Box,
  Flex,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Badge,
  Tooltip,
  HStack,
  Text,
  Icon,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiInfo } from 'react-icons/fi';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

interface Reagent {
  id: string;
  name: string;
  description: string;
  unit: string;
  stockCount?: number;
  totalQuantity?: number;
  createdAt?: string;
}

interface EnhancedReagentInventoryProps {
  updateStats: () => void;
}

export default function EnhancedReagentInventory({ updateStats }: EnhancedReagentInventoryProps) {
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [filteredReagents, setFilteredReagents] = useState<Reagent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'unit' | 'stockCount'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentReagent, setCurrentReagent] = useState<Reagent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    unit: ''
  });
  
  // Delete confirmation state
  const [reagentToDelete, setReagentToDelete] = useState<string | null>(null);
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();
  const cancelRef = React.useRef(null);
  
  // Form modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { fetchWithAuth } = useFetchWithAuth();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Fetch reagents data
  const fetchReagents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth('/api/reagents?include=stockStats');
      setReagents(data);
      setFilteredReagents(data);
    } catch (error) {
      console.error('Error fetching reagents:', error);
      toast({
        title: "Error",
        description: "Could not fetch reagents data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast]);

  useEffect(() => {
    fetchReagents();
  }, [fetchReagents]);

  // Filter and sort reagents
  useEffect(() => {
    let result = [...reagents];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(reagent => 
        reagent.name.toLowerCase().includes(searchLower) || 
        reagent.description?.toLowerCase().includes(searchLower) ||
        reagent.unit.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    result.sort((a, b) => {
      let valueA, valueB;
      
      // Handle different field types
      if (sortField === 'stockCount') {
        valueA = a[sortField] || 0;
        valueB = b[sortField] || 0;
      } else {
        valueA = a[sortField]?.toLowerCase() || '';
        valueB = b[sortField]?.toLowerCase() || '';
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredReagents(result);
  }, [reagents, searchTerm, sortField, sortDirection]);

  const toggleSort = (field: 'name' | 'unit' | 'stockCount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      unit: ''
    };
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.unit.trim()) {
      errors.unit = 'Unit is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (reagent: Reagent | null = null) => {
    setCurrentReagent(reagent);
    if (reagent) {
      setFormData({
        name: reagent.name,
        description: reagent.description || '',
        unit: reagent.unit
      });
    } else {
      setFormData({
        name: '',
        description: '',
        unit: ''
      });
    }
    setFormErrors({ name: '', unit: '' });
    setErrorMessage('');
    onOpen();
  };

  // Submit form for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (currentReagent) {
        // Update existing reagent
        const response = await fetchWithAuth(`/api/reagents/${currentReagent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        
        // Update the reagent in the list
        setReagents(prev => 
          prev.map(r => r.id === currentReagent.id ? { ...r, ...response } : r)
        );
        
        toast({
          title: "Success",
          description: "Reagent updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new reagent
        const response = await fetchWithAuth('/api/reagents', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        
        setReagents(prev => [...prev, response]);
        
        toast({
          title: "Success",
          description: "Reagent added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
      updateStats();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete confirmation
  const confirmDelete = (reagentId: string) => {
    setReagentToDelete(reagentId);
    openDeleteDialog();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!reagentToDelete) return;
    
    setIsLoading(true);
    try {
      await fetchWithAuth(`/api/reagents/${reagentToDelete}`, {
        method: 'DELETE'
      });
      
      setReagents(prev => prev.filter(r => r.id !== reagentToDelete));
      
      toast({
        title: "Success",
        description: "Reagent deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      closeDeleteDialog();
      updateStats();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error:', error);
      
      // Check for specific error type (reagent has stock entries)
      if (error.message && error.message.includes('stock entries')) {
        toast({
          title: "Cannot Delete",
          description: "This reagent has existing stock entries. Archive it instead or delete the stock entries first.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Could not delete reagent",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
      setReagentToDelete(null);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: 'name' | 'unit' | 'stockCount') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <Box p={5}>
      {/* Action bar with search and add button */}
      <Flex mb={5} justifyContent="space-between" alignItems="center" flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={3}>
        <InputGroup maxW={{ base: 'full', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search reagents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
          />
        </InputGroup>
        
        <HStack>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="brand"
            onClick={() => handleOpenModal()}
            size={isMobile ? "sm" : "md"}
            ml={{ base: 0, md: 3 }}
            w={{ base: 'full', md: 'auto' }}
            transition="all 0.2s ease"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            _active={{ transform: "translateY(0)" }}
          >
            Add Reagent
          </Button>
        </HStack>
      </Flex>

      {/* Tabla de reactivos */}
      <Box 
        overflowX="auto" 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor={borderColor}
        bg={bgColor}
        shadow="sm"
        transition="all 0.3s ease"
        _hover={{ shadow: "md" }}
      >
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th 
                cursor="pointer" 
                onClick={() => toggleSort('name')}
                position="relative"
                _hover={{ bg: "gray.100" }}
                transition="background 0.2s"
              >
                Name {renderSortIndicator('name')}
              </Th>
              <Th>Description</Th>
              <Th 
                cursor="pointer" 
                onClick={() => toggleSort('unit')}
                _hover={{ bg: "gray.100" }}
                transition="background 0.2s"
              >
                Unit {renderSortIndicator('unit')}
              </Th>
              <Th 
                cursor="pointer"
                onClick={() => toggleSort('stockCount')}
                _hover={{ bg: "gray.100" }}
                transition="background 0.2s"
                textAlign="center"
              >
                Stock {renderSortIndicator('stockCount')}
              </Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && !filteredReagents.length ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Spinner size="lg" color="brand.500" />
                  <Text mt={2} color="gray.500">Loading reagents...</Text>
                </Td>
              </Tr>
            ) : filteredReagents.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Icon as={FiInfo} boxSize={8} color="gray.400" />
                  <Text mt={2} color="gray.500">
                    {searchTerm ? "No reagents match your search" : "No reagents found. Add your first reagent!"}
                  </Text>
                </Td>
              </Tr>
            ) : (
              filteredReagents.map((reagent) => (
                <Tr 
                  bg={bgColor} 
                  _hover={{ bg: hoverBgColor }} 
                  key={reagent.id}
                  transition="background-color 0.2s"
                >
                  <Td fontWeight="medium">
                    {reagent.name}
                  </Td>
                  <Td color="gray.600" maxW="300px" isTruncated>
                    {reagent.description || "-"}
                  </Td>
                  <Td>
                    <Badge colorScheme="brand" variant="subtle" px={2} py={1}>
                      {reagent.unit}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    <HStack justify="center">
                      <Badge 
                        colorScheme={(reagent.stockCount || 0) > 0 ? "green" : "red"} 
                        px={2} 
                        py={1} 
                        borderRadius="full"
                      >
                        {reagent.stockCount || 0} items
                      </Badge>
                      {(reagent.totalQuantity || 0) > 0 && (
                        <Tooltip label={`${reagent.totalQuantity} ${reagent.unit} total`} placement="top">
                          <Text fontSize="xs" color="gray.500" ml={1}>
                            {reagent.totalQuantity} {reagent.unit}
                          </Text>
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                  <Td textAlign="right">
                    <Menu isLazy>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon as={FiMoreVertical} />}
                        variant="ghost"
                        size="sm"
                        aria-label="Actions"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<Icon as={FiEdit} color="brand.500" />} 
                          onClick={() => handleOpenModal(reagent)}
                        >
                          Edit Reagent
                        </MenuItem>
                        <MenuItem 
                          icon={<Icon as={FiTrash2} color="red.500" />} 
                          onClick={() => confirmDelete(reagent.id)}
                          color="red.500"
                        >
                          Delete Reagent
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal para agregar/editar reactivos */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="md"
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.300"
          backdropFilter="blur(5px)"
        />
        <ModalContent
          shadow="lg"
          borderRadius="lg"
          bg={bgColor}
          mx={4}
        >
          <ModalHeader>
            {currentReagent ? 'Edit Reagent' : 'Add New Reagent'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              {errorMessage && (
                <Box mb={4} color="red.500" p={2} bg="red.50" borderRadius="md">
                  {errorMessage}
                </Box>
              )}
              
            <FormControl isRequired isInvalid={!!formErrors.name} mb={4}>
              <FormLabel>Name</FormLabel>
              <Input 
                name="name"
                value={formData.name} 
                onChange={handleInputChange}
                placeholder="e.g., Ethanol"
              />
              {formErrors.name && (
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Input 
                name="description"
                value={formData.description} 
                onChange={handleInputChange}
                placeholder="Optional description"
              />
            </FormControl>
            
            <FormControl isRequired isInvalid={!!formErrors.unit} mb={4}>
              <FormLabel>Unit of Measure</FormLabel>
              <Input 
                name="unit"
                value={formData.unit} 
                onChange={handleInputChange}
                placeholder="e.g., ml, g, units"
              />
              {formErrors.unit && (
                <FormErrorMessage>{formErrors.unit}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              transition="all 0.2s"
              _hover={{ bg: hoverBgColor }}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              isLoading={isLoading} 
              type="submit"
              transition="all 0.2s ease"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
              _active={{ transform: "translateY(0)" }}
            >
              {currentReagent ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

    {/* Delete Confirmation Dialog */}
    <AlertDialog
      isOpen={isDeleteDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={closeDeleteDialog}
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(5px)"
      >
        <AlertDialogContent
          shadow="lg"
          borderRadius="lg"
          mx={4}
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Reagent
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete this reagent? This action cannot be undone.
            <Text fontSize="sm" color="red.500" mt={2}>
              Note: Reagents with existing stock entries cannot be deleted.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button 
              ref={cancelRef} 
              onClick={closeDeleteDialog}
              transition="all 0.2s"
              _hover={{ bg: hoverBgColor }}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete} 
              ml={3} 
              isLoading={isLoading}
              transition="all 0.2s ease"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
              _active={{ transform: "translateY(0)" }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
    </Box>
  );
}

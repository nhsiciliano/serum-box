import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Badge,
  Spinner,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  useToast,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiArchive,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import { useFetchWithAuth } from '@/hooks/useFetchWithAuth';

// Interfaces
interface Stock {
  id: string;
  reagentId: string;
  reagent: {
    name: string;
    unit: string;
  };
  quantity: number;
  lotNumber: string;
  expirationDate: string;
  entryDate: string;
  isActive: boolean;
  disposalDate?: string;
  durationDays?: number;
  notes?: string;
}

interface Reagent {
  id: string;
  name: string;
  unit: string;
}

interface EnhancedStockControlProps {
  updateStats: () => void;
}

export default function EnhancedStockControl({ updateStats }: EnhancedStockControlProps) {
  // Estado
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disposed'>('active');
  const [reagentFilter, setReagentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'reagent.name' | 'quantity' | 'expirationDate' | 'entryDate'>('entryDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    reagentId: '',
    quantity: '',
    lotNumber: '',
    expirationDate: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({
    reagentId: '',
    quantity: '',
    lotNumber: '',
    expirationDate: ''
  });
  
  // Delete confirmation
  const [stockToDispose, setStockToDispose] = useState<string | null>(null);
  const [disposalReason, setDisposalReason] = useState('');
  
  // Hooks
  const { fetchWithAuth } = useFetchWithAuth();
  const toast = useToast();
  // Estados para modales
  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
  const { isOpen: isDisposeOpen, onOpen: openDispose, onClose: closeDispose } = useDisclosure();
  const cancelRef = React.useRef(null);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const expiredColor = useColorModeValue('red.500', 'red.300');
  
  // Fetch stock data and reagents
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stocksData, reagentsData] = await Promise.all([
        fetchWithAuth('/api/stock'),
        fetchWithAuth('/api/reagents')
      ]);
      setStocks(stocksData);
      setReagents(reagentsData);
      if (updateStats) updateStats();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Could not fetch stock data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast, updateStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Filter and sort stocks
  useEffect(() => {
    let result = [...stocks];
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(stock => 
        statusFilter === 'active' ? stock.isActive : !stock.isActive
      );
    }
    
    // Filter by reagent
    if (reagentFilter !== 'all') {
      result = result.filter(stock => stock.reagentId === reagentFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(stock =>
        stock.reagent.name.toLowerCase().includes(searchLower) ||
        stock.lotNumber.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      // Manejar la propiedad anidada para reagent.name y manejo seguro de valores indefinidos
      let valueA, valueB;
      
      if (sortField === 'reagent.name') {
        valueA = a.reagent?.name?.toLowerCase() || '';
        valueB = b.reagent?.name?.toLowerCase() || '';
      } else {
        valueA = a[sortField] || '';
        valueB = b[sortField] || '';
      }
      
      // Para fechas, convertir a timestamp
      if (sortField === 'expirationDate' || sortField === 'entryDate') {
        return sortDirection === 'asc'
          ? new Date(valueA as string).getTime() - new Date(valueB as string).getTime()
          : new Date(valueB as string).getTime() - new Date(valueA as string).getTime();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredStocks(result);
  }, [stocks, searchTerm, statusFilter, reagentFilter, sortField, sortDirection]);
  
  // Toggle sort direction or change sort field
  const toggleSort = (field: 'reagent.name' | 'quantity' | 'expirationDate' | 'entryDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Check if a date is expired or expiring soon (within 30 days)
  const getExpirationStatus = (dateString: string): 'expired' | 'expiring' | 'ok' => {
    const today = new Date();
    const expirationDate = new Date(dateString);
    
    if (expirationDate < today) {
      return 'expired';
    }
    
    // Calculate days until expiration
    const daysUntilExpiration = Math.floor(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilExpiration <= 30 ? 'expiring' : 'ok';
  };
  
  // Format date for display (YYYY-MM-DD → DD/MM/YYYY)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate days remaining until expiration
  const getDaysRemaining = (dateString: string): number => {
    const today = new Date();
    const expiration = new Date(dateString);
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors = {
      reagentId: '',
      quantity: '',
      lotNumber: '',
      expirationDate: ''
    };
    
    let isValid = true;
    
    if (!formData.reagentId) {
      errors.reagentId = 'Reagent is required';
      isValid = false;
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      errors.quantity = 'Valid quantity is required';
      isValid = false;
    }
    
    if (!formData.lotNumber.trim()) {
      errors.lotNumber = 'Lot number is required';
      isValid = false;
    }
    
    if (!formData.expirationDate) {
      errors.expirationDate = 'Expiration date is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Open the form modal for adding a new stock entry
  const handleOpenForm = () => {
    setFormData({
      reagentId: '',
      quantity: '',
      lotNumber: '',
      expirationDate: '',
      notes: ''
    });
    setFormErrors({
      reagentId: '',
      quantity: '',
      lotNumber: '',
      expirationDate: ''
    });
    openForm();
  };
  
  // Open the disposal modal for a stock entry
  const handleOpenDispose = (stockId: string) => {
    setStockToDispose(stockId);
    setDisposalReason('');
    openDispose();
  };
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Submit stock entry form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetchWithAuth('/api/stock', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setStocks(prev => [...prev, ...response]);
      
      closeForm();
      
      toast({
        title: "Success",
        description: `${response.length} stock entries added successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      if (updateStats) updateStats();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Could not add stock entries",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle stock disposal confirmation
  const handleDispose = async () => {
    if (!stockToDispose) return;
    
    setIsLoading(true);
    
    try {
      await fetchWithAuth(`/api/stock/${stockToDispose}/dispose`, {
        method: 'POST',
        body: JSON.stringify({ reason: disposalReason })
      });
      
      // Update the disposed item in the state
      setStocks(prev => prev.map(stock => 
        stock.id === stockToDispose ? { ...stock, isActive: false } : stock
      ));
      
      closeDispose();
      
      toast({
        title: "Success",
        description: "Stock entry disposed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      if (updateStats) updateStats();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Could not dispose of stock entry",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setStockToDispose(null);
      setDisposalReason('');
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: 'reagent.name' | 'quantity' | 'expirationDate' | 'entryDate') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <Icon as={FiChevronUp} ml={1} /> : <Icon as={FiChevronDown} ml={1} />;
  };
  
  // Renderización del componente
  return (
    <Box p={5} data-testid="stock-control-container">
      {/* Cabecera con búsqueda y filtros */}
      <Flex 
        mb={5} 
        flexDirection={{ base: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ base: 'flex-start', md: 'center' }}
        gap={3}
      >
        <HStack spacing={4} flex="1" wrap="wrap" mb={{ base: 3, md: 0 }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bgColor}
            />
          </InputGroup>
          
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disposed')}
            w={{ base: 'full', md: '150px' }}
            bg={bgColor}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disposed">Disposed</option>
          </Select>
          
          <Select 
            value={reagentFilter} 
            onChange={(e) => setReagentFilter(e.target.value)}
            w={{ base: 'full', md: '180px' }}
            bg={bgColor}
            borderColor={borderColor}
            transition="all 0.2s ease"
            _hover={{ borderColor: 'brand.300' }}
          >
            <option value="all">All Reagents</option>
            {reagents.map(reagent => (
              <option key={reagent.id} value={reagent.id}>
                {reagent.name}
              </option>
            ))}
          </Select>
        </HStack>
        
        <Button
          leftIcon={<Icon as={FiPlus} />}
          colorScheme="brand"
          onClick={handleOpenForm}
          size={{ base: 'sm', md: 'md' }}
          transition="all 0.2s ease"
          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          _active={{ transform: "translateY(0)" }}
        >
          Add Stock
        </Button>
      </Flex>
      
      {/* Tabla de stocks */}
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
                onClick={() => toggleSort('reagent.name')}
              >
                <Flex align="center">
                  Reagent {renderSortIndicator('reagent.name')}
                </Flex>
              </Th>
              <Th>Lot Number</Th>
              <Th 
                cursor="pointer"
                onClick={() => toggleSort('quantity')}
                _hover={{ bg: hoverBgColor }}
                transition="background 0.2s"
              >
                <Flex align="center">
                  Quantity {renderSortIndicator('quantity')}
                </Flex>
              </Th>
              <Th 
                cursor="pointer"
                onClick={() => toggleSort('expirationDate')}
                _hover={{ bg: hoverBgColor }}
                transition="background 0.2s"
              >
                <Flex align="center">
                  Expiration {renderSortIndicator('expirationDate')}
                </Flex>
              </Th>
              <Th 
                cursor="pointer"
                onClick={() => toggleSort('entryDate')}
                _hover={{ bg: hoverBgColor }}
                transition="background 0.2s"
              >
                <Flex align="center">
                  Entry Date {renderSortIndicator('entryDate')}
                </Flex>
              </Th>
              <Th>Status</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && !filteredStocks.length ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10}>
                  <Spinner size="lg" color="brand.500" />
                  <Text mt={2} color="gray.500">Loading stock data...</Text>
                </Td>
              </Tr>
            ) : filteredStocks.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10}>
                  <Icon as={FiInfo} boxSize={8} color="gray.400" />
                  <Text mt={2} color="gray.500">
                    {searchTerm || reagentFilter !== 'all' || statusFilter !== 'all' 
                      ? "No results match your search criteria" 
                      : "No stock entries found. Add your first stock entry!"}
                  </Text>
                </Td>
              </Tr>
            ) : (
            filteredStocks.map((stock) => {
              const expirationStatus = getExpirationStatus(stock.expirationDate);
              const daysRemaining = getDaysRemaining(stock.expirationDate);
              
              return (
                <Tr 
                  key={stock.id}
                  _hover={{ bg: hoverBgColor }}
                  transition="background 0.2s"
                  opacity={stock.isActive ? 1 : 0.7}
                >
                  <Td>
                    {stock.reagent.name}
                  </Td>
                  <Td>
                    {stock.lotNumber}
                  </Td>
                  <Td>
                    {stock.quantity} {stock.reagent.unit}
                  </Td>
                  <Td>
                    <Flex alignItems="center">
                      {stock.isActive && expirationStatus === 'expired' ? (
                        <Badge colorScheme="red" mr={2}>Expired</Badge>
                      ) : stock.isActive && expirationStatus === 'expiring' ? (
                        <Badge colorScheme="orange" mr={2}>Soon</Badge>
                      ) : null}
                      <Text>{formatDate(stock.expirationDate)}</Text>
                      {stock.isActive && expirationStatus !== 'ok' && (
                        <Tooltip label={`${Math.abs(daysRemaining)} days ${daysRemaining < 0 ? 'overdue' : 'remaining'}`}>
                          <Icon 
                            as={FiAlertCircle} 
                            color={expirationStatus === 'expired' ? expiredColor : warningColor} 
                            ml={2} 
                          />
                        </Tooltip>
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    {formatDate(stock.entryDate)}
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={stock.isActive ? 'green' : 'gray'}
                      px={2} 
                      py={1}                         
                      borderRadius="full"
                    >
                      {stock.isActive ? 'Active' : 'Disposed'}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    {stock.isActive && (
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
                            icon={<Icon as={FiArchive} color="orange.500" />} 
                            onClick={() => handleOpenDispose(stock.id)}
                            color="orange.500"
                          >
                            Dispose Entry
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </Box>
      {/* Modal de agregar stock */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm}
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
          <ModalHeader>Add Stock Entry</ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.reagentId}>
                  <FormLabel>Reagent</FormLabel>
                  <Select
                    name="reagentId"
                    value={formData.reagentId}
                    onChange={handleInputChange}
                    placeholder="Select reagent"
                  >
                    {reagents.map(reagent => (
                      <option key={reagent.id} value={reagent.id}>
                        {reagent.name} ({reagent.unit})
                      </option>
                    ))}
                  </Select>
                  {formErrors.reagentId && (
                    <FormErrorMessage>{formErrors.reagentId}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isRequired isInvalid={!!formErrors.quantity}>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    name="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                  {formErrors.quantity && (
                    <FormErrorMessage>{formErrors.quantity}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isRequired isInvalid={!!formErrors.lotNumber}>
                  <FormLabel>Lot Number</FormLabel>
                  <Input
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleInputChange}
                  />
                  {formErrors.lotNumber && (
                    <FormErrorMessage>{formErrors.lotNumber}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl isRequired isInvalid={!!formErrors.expirationDate}>
                  <FormLabel>Expiration Date</FormLabel>
                  <Input
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.expirationDate && (
                    <FormErrorMessage>{formErrors.expirationDate}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <Input
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={closeForm} isDisabled={isLoading}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                type="submit" 
                isLoading={isLoading}
              >
                Add Stock
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Dialogo de confirmación de disposición */}
      <AlertDialog
        isOpen={isDisposeOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDispose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Dispose Stock Entry
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="stretch" spacing={4}>
                <Text>Are you sure you want to dispose this stock entry?</Text>
                <FormControl>
                  <FormLabel>Reason for disposal (optional)</FormLabel>
                  <Input 
                    value={disposalReason}
                    onChange={(e) => setDisposalReason(e.target.value)}
                    placeholder="e.g., Expired, Used up, Contaminated"
                  />
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDispose}>
                Cancel
              </Button>
              <Button colorScheme="orange" onClick={handleDispose} ml={3} isLoading={isLoading}>
                Dispose
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
    );
}

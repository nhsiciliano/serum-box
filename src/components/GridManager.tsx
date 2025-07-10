import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  IconButton
} from '@chakra-ui/react';
import { FiPlus, FiDatabase, FiSearch, FiMoreVertical, FiEdit, FiTrash2, FiShare2, FiGrid } from 'react-icons/fi';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardSection, EmptyState } from './ResponsiveContainers';

// Utilizamos el componente Card básico para combinar con NextLink
// y aplicamos animaciones con CSS

interface Tube {
  id: string;
  position: string;
  data: Record<string, string>;
}

interface Grid {
  id: string;
  name: string;
  tubes: Tube[];
  createdAt?: string;
  updatedAt?: string;
}

interface GridManagerProps {
  grids: Grid[];
  canCreateGrid: boolean;
  onCreateGrid: () => void;
  onDeleteGrid?: (gridId: string) => void;
}

export default function GridManager({
  grids,
  canCreateGrid,
  onCreateGrid,
  onDeleteGrid
}: GridManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  
  // Filter and sort grids
  const filteredGrids = grids
    .filter(grid => grid.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'tubes') {
        return (b.tubes?.length || 0) - (a.tubes?.length || 0);
      } else if (sortBy === 'recent' && a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });
    
  const handleActionClick = (e: React.MouseEvent, gridId: string, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'edit') {
      router.push(`/dashboard/gradilla/${gridId}`);
    } else if (action === 'delete') {
      setSelectedGridId(gridId);
      onOpen();
    } else if (action === 'share') {
      // Share functionality - could be implemented later
      console.log('Share grid', gridId);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (selectedGridId && onDeleteGrid) {
      setIsDeleting(true);
      try {
        await onDeleteGrid(selectedGridId);
      } catch (error) {
        console.error("Failed to delete grid:", error);
        // Optionally, add a toast notification for the error
      } finally {
        setIsDeleting(false);
        onClose();
      }
    }
  };

  const getGridPercentageFilled = (grid: Grid) => {
    // Calculate how full a grid is based on possible positions
    // This is a placeholder - actual logic would depend on grid structure
    const avgRowsPerGrid = 8; // A-H
    const avgColsPerGrid = 12; // 1-12
    const totalPotentialPositions = avgRowsPerGrid * avgColsPerGrid;
    const percentage = Math.min(100, Math.round((grid.tubes?.length || 0) / totalPotentialPositions * 100));
    return percentage;
  };

  return (
    <DashboardSection>
      {/* Header with actions */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={3}>
        <Heading as="h3" size="md" color="gray.700">
          Your Grids
        </Heading>
        
        <HStack spacing={3}>
          {/* Search input */}
          <InputGroup maxW="200px" size={isMobile ? "sm" : "md"}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search grids" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="md"
            />
          </InputGroup>
          
          {/* Sort dropdown */}
          <Select 
            size={isMobile ? "sm" : "md"} 
            maxW="150px" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">By Name</option>
            <option value="tubes">By Tubes Count</option>
            <option value="recent">Most Recent</option>
          </Select>
          
          {/* Create button */}
          <Tooltip 
            label={canCreateGrid ? "Create a new grid" : "Grid limit reached for your plan"} 
            placement="top"
          >
            <Button 
              colorScheme="brand" 
              onClick={onCreateGrid}
              leftIcon={<Icon as={FiPlus} />}
              size={isMobile ? "sm" : "md"}
              isDisabled={!canCreateGrid}
            >
              Create Grid
            </Button>
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Grid cards */}
      {filteredGrids.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
          {filteredGrids.map((grid) => {
            const fillPercentage = getGridPercentageFilled(grid);
            const fillColor = fillPercentage > 80 
              ? "red.500" 
              : fillPercentage > 50 
                ? "orange.400" 
                : "green.500";
                
            return (
              <Box key={grid.id} position="relative">
                <Card 
                  variant="outline"
                  height="180px"
                  position="relative"
                  overflow="hidden"
                  borderColor={borderColor}
                  bg={bgColor}
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: 'all 0.2s ease'
                  }}
                  as={NextLink}
                  href={`/dashboard/gradilla/${grid.id}`}
                >
                {/* Accent border */}
                <Box 
                  position="absolute" 
                  top={0} 
                  left={0} 
                  width="8px" 
                  height="100%" 
                  bg={accentColor} 
                />
                
                {/* Contenido interno de la tarjeta */}
                
                {/* Tube count badge */}
                <Badge 
                  position="absolute"
                  top={2}
                  left={6}
                  colorScheme="brand"
                  variant="solid"
                  size="sm"
                >
                  {grid.tubes?.length || 0} tubes
                </Badge>
                
                {/* Content */}
                <CardBody display="flex" flexDirection="column" justifyContent="space-between" py={6} pl={6}>
                  <Flex direction="column" alignItems="center" justifyContent="center" mt={6}>
                    <Icon as={FiGrid} boxSize={8} mb={2} color={accentColor} />
                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                      {grid.name}
                    </Text>
                  </Flex>
                  
                  {/* Capacity visualization */}
                  <Box mt={4}>
                    <Flex alignItems="center">
                      <Flex flexGrow={1} bg="gray.100" height="8px" borderRadius="full" overflow="hidden">
                        <Box 
                          width={`${fillPercentage}%`} 
                          bg={fillColor}
                          height="100%"
                          transition="width 0.5s ease-in-out"
                        />
                      </Flex>
                      <Text ml={2} fontSize="xs" fontWeight="medium" color="gray.500">
                        {fillPercentage}%
                      </Text>
                    </Flex>
                    <Text fontSize="xs" mt={1} color="gray.500">
                      Capacity used
                    </Text>
                  </Box>
                </CardBody>
              </Card>
              
              {/* Actions menu - Colocado fuera del Card para evitar problemas de propagación */}
              <Menu isLazy>
                <MenuButton
                  as={IconButton}
                  aria-label="Grid options"
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={2}
                />
                <MenuList>
                  <MenuItem icon={<FiEdit />} color="brand.500" onClick={(e) => handleActionClick(e, grid.id, 'edit')}>
                    Edit Grid
                  </MenuItem>
                  <MenuItem icon={<FiShare2 />} color="brand.500" onClick={(e) => handleActionClick(e, grid.id, 'share')}>
                    Share Grid
                  </MenuItem>
                  <MenuItem icon={<FiTrash2 />} color="red.500" onClick={(e) => handleActionClick(e, grid.id, 'delete')}>
                    Delete Grid
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
            );
          })}
        </SimpleGrid>
      ) : (
        <EmptyState>
          <Icon as={FiDatabase} boxSize={12} color="gray.400" mb={4} />
          <Text fontSize="xl" color="gray.500" mb={6}>
            {searchTerm 
              ? "No grids found matching your search" 
              : "No grids yet. Start creating your custom grids."}
          </Text>
          {!searchTerm && (
            <Button 
              colorScheme="brand" 
              onClick={onCreateGrid}
              leftIcon={<Icon as={FiPlus} />}
              size="lg"
              isDisabled={!canCreateGrid}
            >
              Create First Grid
            </Button>
          )}
        </EmptyState>
      )}
      
      {/* Delete confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="brand.700">Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody color="gray.700">
            Are you sure you want to delete this grid? This action cannot be undone.
            All associated tubes and data will be permanently removed.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              loadingText="Deleting..."
            >
              Delete Grid
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardSection>
  );
}

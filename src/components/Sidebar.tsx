import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Box,
  Flex,
  VStack,
  Icon,
  Link,
  Text,
  Image,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { IconType } from 'react-icons';
import { FiHome, FiDatabase, FiSettings, FiLogOut } from 'react-icons/fi';
import { AiOutlineAudit } from 'react-icons/ai';
import { GrGrid } from 'react-icons/gr';
import { MdInventory } from 'react-icons/md';

interface NavItemProps {
  icon: IconType;
  children: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  isCollapsed?: boolean;
}

interface NavCategory {
  title: string;
  items: {
    name: string;
    icon: IconType;
    href?: string;
    onClick?: () => void;
  }[];
}

const NavItem = ({ 
  icon, 
  children, 
  href, 
  onClick, 
  isActive = false, 
  isCollapsed = false
}: NavItemProps) => (
  <Link
    as={href ? NextLink : 'button'}
    href={href}
    onClick={onClick}
    style={{ textDecoration: 'none', width: '100%' }}
    _focus={{ boxShadow: 'none' }}
    role="group"
  >
    <Tooltip label={isCollapsed ? children : ''} placement="right" isDisabled={!isCollapsed}>
      <Flex
        align="center"
        p={4}
        mx={isCollapsed ? 0 : 4}
        borderRadius="lg"
        cursor="pointer"
        color="black"
        bg={isActive ? 'brand.100' : 'transparent'}
        borderLeft={isActive ? '4px solid' : '4px solid transparent'}
        borderLeftColor={isActive ? 'brand.500' : 'transparent'}
        _hover={{
          bg: 'brand.200',
          color: 'brand.500',
        }}
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
      >
        {icon && (
          <Icon
            mr={isCollapsed ? 0 : 4}
            fontSize="20"
            color={isActive ? 'brand.500' : 'black'}
            _groupHover={{
              color: 'brand.500',
            }}
            as={icon}
          />
        )}
        {!isCollapsed && children}
      </Flex>
    </Tooltip>
  </Link>
);

export default function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sidebarStateChange', {
        detail: { collapsed },
      });
      window.dispatchEvent(event);
    }
  };
  
  // Group navigation items by category
  const navigationCategories: NavCategory[] = [
    {
      title: 'Dashboard',
      items: [
        { name: 'Home', icon: FiHome, href: '/dashboard' }
      ]
    },
    {
      title: 'Grid Management',
      items: [
        { name: 'Create Grid', icon: GrGrid, href: '/dashboard/create-grilla' },
        { name: 'View Grids', icon: FiDatabase, href: '/dashboard/gradilla' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { name: 'Stock Manager', icon: MdInventory, href: '/dashboard/inventory' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { name: 'Audit Log', icon: AiOutlineAudit, href: '/dashboard/audit-log' },
        { name: 'Manage Account', icon: FiSettings, href: '/dashboard/admin-cuenta' },
        { name: 'Sign Out', icon: FiLogOut, onClick: onSignOut }
      ]
    }
  ];

  return (
    <Box
      onMouseEnter={() => setSidebarCollapsed(false)}
      onMouseLeave={() => setSidebarCollapsed(true)}
      w={isCollapsed ? '80px' : '250px'}
      bg="brand.200"
      position="fixed"
      h="100vh"
      left={0}
      top={0}
      zIndex={15}
      transition="width 0.3s"
      overflowY="auto"
      overflowX="hidden"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#00a86b',
          borderRadius: '24px',
        },
      }}
    >
      <VStack spacing={6} align="stretch" p={5}>
        <Flex align="center" mb={5} justify={isCollapsed ? "center" : "space-between"}>
          <Box overflow="hidden" width={isCollapsed ? "40px" : "auto"}>
            <Image
              src="/images/serum-box.png"
              alt="SerumBox Logo"
              height="40px"
              width={isCollapsed ? "40px" : "auto"}
              objectFit={isCollapsed ? "cover" : "contain"}
              borderRadius={isCollapsed ? "md" : "none"}
            />
          </Box>

        </Flex>
        
        {navigationCategories.map((category, i) => (
          <Box key={i}>
            {!isCollapsed && (
              <Text 
                fontSize="xs" 
                fontWeight="bold" 
                color="gray.500" 
                textTransform="uppercase" 
                mb={2} 
                px={4}
              >
                {category.title}
              </Text>
            )}
            {isCollapsed && i > 0 && <Divider mb={3} />}
            {category.items.map((item, j) => (
              <NavItem
                key={`${i}-${j}`}
                icon={item.icon}
                href={item.href}
                onClick={item.onClick}
                isActive={item.href === pathname}
                isCollapsed={isCollapsed}
              >
                {item.name}
              </NavItem>
            ))}
            {!isCollapsed && i < navigationCategories.length - 1 && <Box mb={4} />}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

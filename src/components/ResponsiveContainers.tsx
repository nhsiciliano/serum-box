import { 
  Box, 
  Heading, 
  Flex, 
  useBreakpointValue,
  Container,
  Text,
  useColorModeValue,
  BoxProps,
  FlexProps,
  HeadingProps
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface SectionProps extends BoxProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  titleProps?: HeadingProps;
  noContainer?: boolean;
  fullWidth?: boolean;
}

/**
 * Responsive section container with adaptive padding
 */
export function DashboardSection({
  children,
  title,
  subtitle,
  titleProps,
  noContainer,
  fullWidth,
  ...rest
}: SectionProps) {
  const padding = useBreakpointValue({ base: 4, md: 6 });
  const spacing = useBreakpointValue({ base: 5, md: 6 });
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const sectionBg = useColorModeValue('white', 'gray.800');
  const sectionBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
  const titleColor = useColorModeValue('gray.800', 'gray.100');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  
  const content = (
    <Box
      bg={sectionBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={sectionBorder}
      boxShadow="0 8px 24px rgba(15, 23, 42, 0.04)"
      p={padding}
      mb={spacing}
      {...rest}
    >
      {title && (
        <Heading
          as="h2"
          size={headingSize}
          mb={subtitle ? 1 : 4}
          color={titleColor}
          {...titleProps}
        >
          {title}
        </Heading>
      )}
      
      {subtitle && (
        <Text
          as="p"
          fontSize="sm"
          fontWeight="medium"
          color={subtitleColor}
          mb={4}
        >
          {subtitle}
        </Text>
      )}
      
      {children}
    </Box>
  );
  
  if (noContainer || fullWidth) {
    return content;
  }
  
  return (
    <Container maxW={fullWidth ? "full" : "container.xl"} px={0}>
      {content}
    </Container>
  );
}

interface ActionRowProps extends FlexProps {
  children: ReactNode;
  mobileStack?: boolean;
}

/**
 * Responsive flex container for action buttons that stacks on mobile
 */
export function ActionRow({ children, mobileStack = true, ...rest }: ActionRowProps) {
  return (
    <Flex
      direction={{ base: mobileStack ? 'column' : 'row', md: 'row' }}
      gap={{ base: 2, md: 4 }}
      w="100%"
      align={{ base: 'stretch', md: 'center' }}
      justify="flex-end"
      mb={4}
      {...rest}
    >
      {children}
    </Flex>
  );
}

interface GridContainerProps extends BoxProps {
  children: ReactNode;
  columns?: { base: number; sm?: number; md?: number; lg?: number; xl?: number };
  spacing?: number | { base: number; sm?: number; md?: number; lg?: number };
}

/**
 * Responsive grid container with customizable columns
 */
export function GridContainer({ 
  children, 
  columns = { base: 1, sm: 2, lg: 3 },
  spacing = { base: 4, md: 6 },
  ...rest 
}: GridContainerProps) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        base: `repeat(${columns.base}, 1fr)`,
        sm: columns.sm ? `repeat(${columns.sm}, 1fr)` : undefined,
        md: columns.md ? `repeat(${columns.md}, 1fr)` : undefined,
        lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : undefined,
        xl: columns.xl ? `repeat(${columns.xl}, 1fr)` : undefined,
      }}
      gap={spacing}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * Empty state container for when there's no data
 */
export function EmptyState({
  children,
  ...rest
}: BoxProps) {
  const emptyBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');

  return (
    <Box
      textAlign="center"
      py={12}
      px={4}
      bg={emptyBg}
      borderRadius="xl"
      borderStyle="dashed"
      borderWidth="1px"
      borderColor={borderColor}
      {...rest}
    >
      {children}
    </Box>
  );
}

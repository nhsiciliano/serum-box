'use client'

import {
    Box,
    Progress,
    Text,
    VStack,
    SimpleGrid,
    Flex,
    Icon,
    Heading,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiGrid, FiBox } from 'react-icons/fi';

interface PlanInfoProps {
    currentGrids: number;
    currentTubes: number;
}

interface UsageCardProps {
    title: string;
    icon: React.ElementType;
    current: number;
    max: number;
    isUnlimited: boolean;
}

const UsageCard = ({ title, icon, current, max, isUnlimited }: UsageCardProps) => {
    const progress = isUnlimited ? 0 : (current / max) * 100;
    const progressColorScheme = progress > 90 ? 'red' : progress > 75 ? 'yellow' : 'teal';
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const cardBg = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');

    return (
        <Box p={4} borderRadius="lg" bg={cardBg} border="1px solid" borderColor={borderColor}>
            <Flex align="center" mb={2}>
                <Icon as={icon} mr={2} color="teal.500" />
                <Text fontWeight="medium" color={textColor}>{title}</Text>
            </Flex>
            <Text fontSize="sm" color="gray.500" mb={2}>
                {current} / {isUnlimited ? 'Ilimitado' : max}
            </Text>
            {!isUnlimited && (
                <Progress 
                    value={progress} 
                    colorScheme={progressColorScheme} 
                    size="sm" 
                    borderRadius="md"
                />
            )}
        </Box>
    );
};

export function PlanInfo({ currentGrids, currentTubes }: PlanInfoProps) {
    const headingColor = useColorModeValue('gray.700', 'gray.200');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200');
    const bodyColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <VStack spacing={6} align="stretch" p={{ base: 4, md: 6 }} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <Flex justify="space-between" align="center">
                <Heading as="h3" size="md" color={headingColor}>
                    Uso del espacio de trabajo
                </Heading>
                <Badge colorScheme="teal" borderRadius="full" px={2.5} py={1}>En vivo</Badge>
            </Flex>

            <Text fontSize="sm" color={bodyColor}>
                Monitoreá cuánto del espacio se está usando activamente en todos los recursos trazados.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <UsageCard 
                    title="Gradillas usadas"
                    icon={FiGrid}
                    current={currentGrids}
                    max={Number.MAX_SAFE_INTEGER}
                    isUnlimited
                />
                <UsageCard 
                    title="Tubos almacenados"
                    icon={FiBox}
                    current={currentTubes}
                    max={Number.MAX_SAFE_INTEGER}
                    isUnlimited
                />
            </SimpleGrid>
        </VStack>
    );
}

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
    const progressColorScheme = progress > 90 ? 'red' : progress > 75 ? 'yellow' : 'green';
    const textColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <Box>
            <Flex align="center" mb={2}>
                <Icon as={icon} mr={2} color="gray.500" />
                <Text fontWeight="medium" color={textColor}>{title}</Text>
            </Flex>
            <Text fontSize="sm" color="gray.500" mb={2}>
                {current} / {isUnlimited ? 'Unlimited' : max}
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

    return (
        <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
                <Heading as="h3" size="md" color={headingColor}>
                    Workspace Usage
                </Heading>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <UsageCard 
                    title="Grids Used"
                    icon={FiGrid}
                    current={currentGrids}
                    max={Number.MAX_SAFE_INTEGER}
                    isUnlimited
                />
                <UsageCard 
                    title="Tubes Stored"
                    icon={FiBox}
                    current={currentTubes}
                    max={Number.MAX_SAFE_INTEGER}
                    isUnlimited
                />
            </SimpleGrid>
        </VStack>
    );
}

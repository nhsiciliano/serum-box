'use client'

import { Box, Progress, Text, VStack } from '@chakra-ui/react';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';

interface PlanInfoProps {
    currentGrids: number;
    currentTubes: number;
}

export function PlanInfo({ currentGrids, currentTubes }: PlanInfoProps) {
    const { restrictions } = usePlanRestrictions();
    
    const gridProgress = (currentGrids / restrictions.maxGrids) * 100;
    const tubeProgress = (currentTubes / restrictions.maxTubes) * 100;

    return (
        <VStack spacing={4} align="stretch" p={4}>
            <Box>
                <Text color="gray.500" mb={2}>
                    Gradillas: {currentGrids} de {restrictions.isUnlimited ? 'Lo que necesites' : restrictions.maxGrids}
                </Text>
                {!restrictions.isUnlimited && (
                    <Progress value={gridProgress} colorScheme="green" />
                )}
            </Box>
            <Box>
                <Text color="gray.500" mb={2}>
                    Tubos: {currentTubes} de {restrictions.isUnlimited ? 'Lo que necesites' : restrictions.maxTubes}
                </Text>
                {!restrictions.isUnlimited && (
                    <Progress value={tubeProgress} colorScheme="blue" />
                )}
            </Box>
        </VStack>
    );
}


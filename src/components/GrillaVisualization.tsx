import React, { useState } from 'react';
import { Box, Grid, GridItem, Text, VStack, useDisclosure, Tooltip } from '@chakra-ui/react';
import TubeModal from './TubeModal';

interface Tube {
    id: string;
    position: string;
    data: Record<string, string>;
}

interface GrillaVisualizationProps {
    title: string;
    rows: string[];
    columns: number[];
    fields: string[];
    tubes: Tube[];
    onTubeAdd: (tube: Omit<Tube, 'id'>) => void;
    onTubeRemove: (tubeId: string) => void;
}

const GrillaVisualization: React.FC<GrillaVisualizationProps> = ({ 
    title, 
    rows, 
    columns, 
    fields,
    tubes,
    onTubeAdd,
    onTubeRemove 
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPosition, setSelectedPosition] = useState('');

    const handleCellClick = (position: string) => {
        const tube = tubes.find(t => t.position === position);
        if (tube) {
            // Si hay un tubo, lo eliminamos
            onTubeRemove(tube.id);
        } else {
            // Si no hay tubo, abrimos el modal para añadir uno
            setSelectedPosition(position);
            onOpen();
        }
    };

    const getTubeColor = (position: string) => {
        return tubes.some(tube => tube.position === position) ? 'red.500' : 'green.500';
    };

    const handleTubeAdd = (tube: Omit<Tube, 'id'>) => {
        onTubeAdd(tube);
        onClose();
    };

    const getTubeInfo = (position: string) => {
        const tube = tubes.find(t => t.position === position);
        if (!tube) return null;
        return (
            <VStack align="start" spacing={1}>
                {Object.entries(tube.data).map(([key, value]) => (
                    <Text key={key} fontSize="sm">{`${key}: ${value}`}</Text>
                ))}
            </VStack>
        );
    };

    return (
        <VStack spacing={4} align="stretch">
            <Text fontSize="2xl" color="gray.500" fontWeight="bold">{title}</Text>
            <Grid templateColumns={`auto repeat(${columns.length}, 1fr)`} gap={1}>
                <GridItem></GridItem>
                {columns.map(col => (
                    <GridItem key={col} textAlign="center">{col}</GridItem>
                ))}
                {rows.map(row => (
                    <React.Fragment key={row}>
                        <GridItem>{row}</GridItem>
                        {columns.map(col => {
                            const position = `${row}${col}`;
                            const tubeInfo = getTubeInfo(position);
                            return (
                                <GridItem key={position}>
                                    <Tooltip label={tubeInfo} isDisabled={!tubeInfo}>
                                        <Box
                                            w="80%"
                                            h="10"
                                            bg={getTubeColor(position)}
                                            borderRadius="md"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            onClick={() => handleCellClick(position)}
                                            cursor="pointer"
                                            transition="all 0.2s"
                                            _hover={{ opacity: 0.8 }}
                                        >
                                            {position}
                                        </Box>
                                    </Tooltip>
                                </GridItem>
                            );
                        })}
                    </React.Fragment>
                ))}
            </Grid>
            <TubeModal
                isOpen={isOpen}
                onClose={onClose}
                position={selectedPosition}
                fields={fields}
                onTubeAdd={handleTubeAdd}
            />
        </VStack>
    );
};

export default GrillaVisualization;

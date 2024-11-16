import React, { useState } from 'react';
import { Box, Grid, GridItem, Text, VStack, useDisclosure, Tooltip } from '@chakra-ui/react';
import TubeModal from './TubeModal';

interface Tube {
    id: string;
    position: string;
    data: Record<string, string>;
}

interface GrillaVisualizationProps {
    rows: string[];
    columns: number[];
    fields: string[];
    tubes: Tube[];
    onTubeAdd: (tube: Omit<Tube, 'id'>) => void;
    onTubeRemove: (tubeId: string) => void;
}

const GrillaVisualization: React.FC<GrillaVisualizationProps> = ({ 
    rows, 
    columns, 
    fields,
    tubes,
    onTubeAdd,
    onTubeRemove 
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPosition, setSelectedPosition] = useState('');

    const getNextPosition = (currentPosition: string): string | undefined => {
        const currentRow = currentPosition.charAt(0);
        const currentCol = parseInt(currentPosition.slice(1));
        
        // Si estamos en la última columna de la fila actual
        if (currentCol === columns[columns.length - 1]) {
            // Encontrar la siguiente fila disponible
            const currentRowIndex = rows.indexOf(currentRow);
            if (currentRowIndex < rows.length - 1) {
                const nextRow = rows[currentRowIndex + 1];
                const nextPosition = `${nextRow}${columns[0]}`;
                // Verificar si la posición está ocupada
                if (!tubes.some(tube => tube.position === nextPosition)) {
                    return nextPosition;
                }
            }
        } else {
            // Avanzar a la siguiente columna en la misma fila
            const nextCol = currentCol + 1;
            const nextPosition = `${currentRow}${nextCol}`;
            // Verificar si la posición está ocupada
            if (!tubes.some(tube => tube.position === nextPosition)) {
                return nextPosition;
            }
        }
        
        // Si no se encuentra una siguiente posición disponible
        return undefined;
    };

    const handleCellClick = (position: string) => {
        const tube = tubes.find(t => t.position === position);
        if (tube) {
            onTubeRemove(tube.id);
        } else {
            setSelectedPosition(position);
            onOpen();
        }
    };

    const getTubeColor = (position: string) => {
        return tubes.some(tube => tube.position === position) ? 'red.500' : 'green.500';
    };

    const handleTubeAdd = async (tube: Omit<Tube, 'id'>, shouldContinue: boolean) => {
        await onTubeAdd(tube);
        
        if (shouldContinue) {
            const nextPos = getNextPosition(tube.position);
            if (nextPos) {
                setSelectedPosition(nextPos);
            } else {
                onClose();
            }
        } else {
            onClose();
        }
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
        <Box>
            <Grid templateColumns={`auto repeat(${columns.length}, 1fr)`} gap={2}>
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
                nextPosition={getNextPosition(selectedPosition)}
            />
        </Box>
    );
};

export default GrillaVisualization;

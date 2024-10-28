import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
} from '@chakra-ui/react';

interface Tube {
    id?: string;
    position: string;
    data: Record<string, string>;
}

interface TubeModalProps {
    isOpen: boolean;
    onClose: () => void;
    position: string;
    fields: string[];
    onTubeAdd: (tube: Tube) => void;
}

const TubeModal: React.FC<TubeModalProps> = ({ isOpen, onClose, position, fields, onTubeAdd }) => {
    const [tubeData, setTubeData] = useState<Record<string, string>>({});

    useEffect(() => {
        // Reiniciar los datos del tubo cuando se abre el modal
        if (isOpen) {
            setTubeData({});
        }
    }, [isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setTubeData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onTubeAdd({ position, data: tubeData });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="gray.800">Agregar tubo en posición {position}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        {fields.map((field) => (
                            <FormControl key={field}>
                                <FormLabel color="gray.800">{field}</FormLabel>
                                <Input
                                    value={tubeData[field] || ''}
                                    color="black"
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    placeholder={`Ingrese ${field}`}
                                />
                            </FormControl>
                        ))}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                        Guardar
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TubeModal;

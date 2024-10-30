"use client"

import { useEffect, useState } from 'react';
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
    Checkbox,
} from '@chakra-ui/react';

interface TubeModalProps {
    isOpen: boolean;
    onClose: () => void;
    position: string;
    fields: string[];
    onTubeAdd: (tube: { position: string; data: Record<string, string> }, continueToNext: boolean) => void;
    nextPosition?: string;
}

const TubeModal: React.FC<TubeModalProps> = ({ 
    isOpen, 
    onClose, 
    position, 
    fields, 
    onTubeAdd,
    nextPosition 
}) => {
    const [tubeData, setTubeData] = useState<Record<string, string>>({});
    const [continueToNext, setContinueToNext] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setTubeData({});
            setContinueToNext(true);
        }
    }, [isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setTubeData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onTubeAdd({ position, data: tubeData }, continueToNext);
        
        if (!continueToNext || !nextPosition) {
            onClose();
        } else {
            setTubeData({});
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color="gray.800">Add tube at position {position}</ModalHeader>
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
                                    placeholder={`Enter ${field}`}
                                />
                            </FormControl>
                        ))}
                        {nextPosition && (
                            <Checkbox 
                                isChecked={continueToNext} 
                                onChange={(e) => setContinueToNext(e.target.checked)}
                                color="gray.800"
                            >
                                Continue to position {nextPosition}
                            </Checkbox>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TubeModal;

import { VStack, Spinner, Text } from '@chakra-ui/react';

const LoadingSpinner = () => {
    return (
        <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
            <Text fontSize="lg" color="gray.600">Loading grids</Text>
        </VStack>
    );
};

export default LoadingSpinner;

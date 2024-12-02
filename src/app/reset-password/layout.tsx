import { Box } from '@chakra-ui/react';

export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box minHeight="100vh" bg="white">
            {children}
        </Box>
    );
} 
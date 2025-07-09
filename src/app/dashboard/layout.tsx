"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
    Box, 
    Flex, 
    ChakraProvider, 
    extendTheme,
    Spinner,
    Center 
} from '@chakra-ui/react';
import DashboardHeader from '@/components/DashboardHeader';

// Extended theme with enhanced styling
const theme = extendTheme({
    colors: {
        brand: {
            100: "#e0fff4",
            200: "#c2ffe7",
            300: "#99ffdb",
            400: "#66ffcd",
            500: "#00a86b",
            600: "#008656",
            700: "#006642",
            800: "#00442d",
            900: "#002219",
        },
        gray: {
            50: "#f9fafb",
            100: "#f3f4f6",
            800: "#1f2937",
            900: "#111827",
        }
    },
    components: {
        Button: {
            baseStyle: {
                _focus: {
                    boxShadow: '0 0 0 3px rgba(0, 168, 107, 0.6)',
                }
            },
        },
        Tooltip: {
            baseStyle: {
                bg: 'gray.800',
                color: 'white',
            }
        }
    },
});



export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Show loading state
    if (status === 'loading') {
        return (
            <ChakraProvider theme={theme}>
                <Center h="100vh">
                    <Spinner 
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="brand.500"
                        size="xl"
                    />
                </Center>
            </ChakraProvider>
        );
    }

    // Protection against unauthenticated access
    if (!session) {
        return null;
    }

    return (
        <ChakraProvider theme={theme}>
            <Flex h="100vh" bg="white" overflow="hidden">
                {/* Main content */}
                <Box 
                    flex={1}
                    position="relative"
                    h="100vh"
                    overflowY="auto"
                    className="main-content"
                >
                    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100%">
                        <DashboardHeader />
                        <Box mt={6}>
                            {children}
                        </Box>
                    </Box>
                </Box>
            </Flex>
        </ChakraProvider>
    );
}

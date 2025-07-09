'use client';

import { Box } from '@chakra-ui/react';
import StockControl from '@/components/StockControl';

export default function InventoryPage() {
    return (
        <Box p={{ base: 4, md: 8 }}>
            <StockControl />
        </Box>
    );
}

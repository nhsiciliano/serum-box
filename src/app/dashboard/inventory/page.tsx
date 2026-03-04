'use client';

import { Box } from '@chakra-ui/react';
import StockControl from '@/components/StockControl';
import { DashboardSection } from '@/components/ResponsiveContainers';

export default function InventoryPage() {
    return (
        <Box>
            <DashboardSection
                title="Control de inventario"
                subtitle="Gestioná el ciclo de lotes, ventanas de vencimiento y estado de descarte."
                fullWidth
            >
                <StockControl />
            </DashboardSection>
        </Box>
    );
}

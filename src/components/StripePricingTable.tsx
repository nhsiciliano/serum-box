'use client'

import Script from 'next/script'

interface StripePricingTableProps {
    clientReferenceId?: string;
    pricingTableId?: string;
    publishableKey?: string;
}

export default function StripePricingTable({ clientReferenceId }: StripePricingTableProps) {
    return (
        <>
            <Script
                async
                src="https://js.stripe.com/v3/pricing-table.js"
            />
            <StripePricingTable
                pricingTableId={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
                publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                clientReferenceId={clientReferenceId}
            />
        </>
    )
}


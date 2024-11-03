'use client';

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import { theme } from '../theme'  // Asegúrate de crear este archivo

export function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any
}) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}

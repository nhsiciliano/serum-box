import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: 'var(--font-display), serif',
    body: 'var(--font-body), sans-serif',
  },
  colors: {
    brand: {
      50: '#e9f9f4',
      100: '#d3f3e8',
      200: '#a9e7d2',
      300: '#7fdabc',
      400: '#4ecaa2',
      500: '#17b07f',
      600: '#0d8d65',
      700: '#076d4f',
      800: '#03503a',
      900: '#013526',
    },
  },
  semanticTokens: {
    colors: {
      'dashboard.canvas': {
        default: 'gray.50',
        _dark: 'gray.900',
      },
      'dashboard.surface': {
        default: 'white',
        _dark: 'gray.800',
      },
      'dashboard.border': {
        default: 'blackAlpha.100',
        _dark: 'whiteAlpha.200',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(23, 176, 127, 0.32)',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'dashboard.border',
          bg: 'dashboard.surface',
        },
      },
    },
  },
});

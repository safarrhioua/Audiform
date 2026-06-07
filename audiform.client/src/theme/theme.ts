import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        tertiary: Palette['primary'];
    }
    interface PaletteOptions {
        tertiary?: PaletteOptions['primary'];
    }
}

declare module '@mui/material/Chip' {
    interface ChipPropsColorOverrides {
        tertiary: true;
    }
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#0058a3',
            light: '#317aba',
            dark: '#003f76',
        },
        secondary: {
            main: '#e62b27',
            light: '#f35552',
            dark: '#b00d0a',
        },
        tertiary: {
            main: '#fabe50',
            light: '#ffd78e',
            dark: '#ed9c07'
        }
    },
    typography: {
        fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        body1: {
            fontSize: '1rem',
            fontWeight: 400,
        },
    },
});

export default theme;
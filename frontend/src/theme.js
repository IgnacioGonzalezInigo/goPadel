import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
    primary: {
        main: '#1976d2', // Azul
        light: '#42a5f5',
        dark: '#1565c0',
    },
    secondary: {
        main: '#dc004e', // Rosa/Rojo
    },
    background: {
        default: '#f5f5f5',
        paper: '#ffffff',
    },
    },
    typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 500,
    },
    },
    shape: {
    borderRadius: 8,
    },
});

export default theme;
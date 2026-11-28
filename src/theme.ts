import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: '[data-theme="%s"]' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#1B272B', dark: '#111A1D', contrastText: '#FFFFFF' },
        secondary: { main: '#B2D560', dark: '#91B33E', contrastText: '#1B272B' },
        background: { default: '#F3F5EF', paper: '#FFFFFF' },
        text: { primary: '#1B272B', secondary: '#66736D' },
        success: { main: '#648A35' },
        warning: { main: '#B9852C' },
        error: { main: '#C65345' },
        info: { main: '#547D86' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#C6E582', dark: '#B2D560', contrastText: '#18251E' },
        secondary: { main: '#A5D3B4', contrastText: '#18251E' },
        background: { default: '#121B17', paper: '#1A2620' },
        text: { primary: '#EDF5ED', secondary: '#ADBCB1' },
        divider: '#34473C',
        success: { main: '#A5D298' },
        warning: { main: '#ECC17B' },
        error: { main: '#F1A8A1' },
        info: { main: '#A6C8E2' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"DM Sans", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.055em' },
    h2: { fontWeight: 800, letterSpacing: '-0.045em' },
    h3: { fontWeight: 800, letterSpacing: '-0.04em' },
    h4: { fontWeight: 800, letterSpacing: '-0.035em' },
    h5: { fontWeight: 750, letterSpacing: '-0.03em' },
    button: { textTransform: 'none', fontWeight: 750 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10, padding: '9px 16px', boxShadow: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 750, borderRadius: 8 } } },
  },
});

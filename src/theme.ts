import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#78A997', dark: '#5F8D7D', contrastText: '#101A1C' },
    secondary: { main: '#C5D8A4' },
    background: { default: '#141B1E', paper: '#1D282C' },
    text: { primary: '#E7EEEB', secondary: '#A1B0AA' },
    success: { main: '#83B99C' },
    warning: { main: '#D8B77C' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.055em' },
    h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.045em' },
    h3: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.04em' },
    h4: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.035em' },
    h5: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.03em' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, padding: '9px 16px', boxShadow: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8, backgroundColor: '#202D31' } } },
  },
});

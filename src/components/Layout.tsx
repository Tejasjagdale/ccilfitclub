import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar } from '@mui/material';

export default function Layout({ children }: { children: ReactNode }) {
  return <Box className="site">
    <AppBar position="static" elevation={0} className="appbar"><Container maxWidth="lg"><Toolbar disableGutters className="toolbar">
      <RouterLink to="/" className="brand">OFF<span>•</span>PACE</RouterLink>
    </Toolbar></Container></AppBar>
    <Container maxWidth="lg" className="page-container">{children}</Container>
    <Box component="footer" className="footer"><Container maxWidth="lg"><span>OFF•PACE</span><span>Company events · Made for everyone</span></Container></Box>
  </Box>;
}

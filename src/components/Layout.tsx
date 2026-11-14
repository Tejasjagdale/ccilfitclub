import type { ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar } from '@mui/material';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Events', to: '/events' },
    { label: 'Athletes', to: '/athletes' },
  ];
  return (
    <Box className="site">
      <AppBar position="static" elevation={0} className="appbar">
        <Container maxWidth="lg">
          <Toolbar disableGutters className="toolbar">
            <RouterLink to="/" className="brand">OFF<span>•</span>PACE</RouterLink>
            <Box className="nav">
              {links.map((link) => <Button key={link.to} component={RouterLink} to={link.to} className={location.pathname === link.to || (link.to === '/athletes' && location.pathname.startsWith('/athletes')) ? 'nav-active' : ''}>{link.label}</Button>)}
            </Box>
            <Button component={RouterLink} to="/register" variant="outlined" className="header-action">Join the group</Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" className="page-container">{children}</Container>
      <Box component="footer" className="footer">
        <Container maxWidth="lg"><span>OFF•PACE</span><span>Company events · Made for everyone</span></Container>
      </Box>
    </Box>
  );
}
import type { ReactNode } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, Container, Toolbar } from '@mui/material';
import { useAppData } from '../context/AppDataContext';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation(); const navigate = useNavigate(); const { currentUser, signOut } = useAppData();
  const links = !currentUser ? [] : currentUser.role === 'ADMIN' && currentUser.status === 'ACTIVE'
    ? [{ label: 'Home', to: '/' }, { label: 'Events', to: '/events' }, { label: 'Athletes', to: '/athletes' }]
    : [{ label: 'Home', to: '/' }, { label: 'Events', to: '/events' }, { label: 'Athletes', to: '/athletes' }];
  return <Box className="site">
    <AppBar position="static" elevation={0} className="appbar"><Container maxWidth="lg"><Toolbar disableGutters className="toolbar">
      <RouterLink to="/" className="brand">OFF<span>•</span>PACE</RouterLink>
      {currentUser && <Box className="nav">{links.map((link) => <Button key={link.to} component={RouterLink} to={link.to} className={location.pathname === link.to || (link.to === '/athletes' && location.pathname.startsWith('/athletes')) || (link.to === '/events' && location.pathname.startsWith('/events')) ? 'nav-active' : ''}>{link.label}</Button>)}{currentUser?.role === 'ADMIN' && currentUser.status === 'ACTIVE' && <Button component={RouterLink} to="/admin" className={location.pathname.startsWith('/admin') ? 'nav-active' : ''}>Admin</Button>}</Box>}
      {currentUser ? <Box className="nav-user"><Avatar>{currentUser.firstName[0]}</Avatar><span>{currentUser.firstName}</span><Button onClick={() => { signOut(); navigate('/signin', { replace: true }); }}>Sign out</Button></Box> : null}
    </Toolbar></Container></AppBar>
    <Container maxWidth="lg" className="page-container">{children}</Container>
    <Box component="footer" className="footer"><Container maxWidth="lg"><span>OFF•PACE</span><span>Company events · Made for everyone</span></Container></Box>
  </Box>;
}

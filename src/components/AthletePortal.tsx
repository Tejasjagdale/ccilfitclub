import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Divider, Menu, MenuItem } from '@mui/material';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { useAppData } from '../context/AppDataContext';
import ThemeToggle from './ThemeToggle';
import './AthletePortal.css';

export default function AthletePortal() {
  const { currentUser, signOut } = useAppData();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const onEvents = pathname === '/' || pathname === '/events' || pathname.startsWith('/events/');

  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search, hash]);

  if (!currentUser) return null;
  const { firstName, lastName, employeeId } = currentUser;
  const initials = firstName[0] + lastName[0];

  return <div className="ath-portal">
    <a className="ath-skip-link" href="#ath-main">Skip to content</a>
    <header className="ath-header">
      <div className="ath-header-inner">
        <Link to="/" className="ath-brand" aria-label="Off Pace events">
          <span className="ath-brand-mark"><BoltRounded /></span><span>OFF<span className="ath-brand-dot">·</span>PACE</span>
        </Link>
        <nav className="ath-header-nav" aria-label="Athlete portal">
          <Link to="/" aria-current={onEvents ? 'page' : undefined}><CalendarMonthOutlined />Events</Link>
        </nav>
        <div className="ath-header-actions">
          <ThemeToggle />
          <button id="ath-account-button" className="ath-account-button" type="button" aria-label="Account menu"
            aria-haspopup="menu" aria-controls={anchor ? 'ath-account-menu' : undefined} aria-expanded={Boolean(anchor)}
            onClick={e => setAnchor(e.currentTarget)}>
            <span className="ath-avatar" aria-hidden="true">{initials}</span><ExpandMoreRounded className="ath-account-chevron" />
          </button>
        </div>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ className: 'ath-account-menu' }} MenuListProps={{ id: 'ath-account-menu', 'aria-labelledby': 'ath-account-button' }}>
          <li className="ath-account-details" role="presentation">
            <span className="ath-avatar" aria-hidden="true">{initials}</span><span><strong>{firstName} {lastName}</strong><small>{employeeId}{currentUser.status === 'RETIRED' ? ' · Retired' : ''}</small></span>
          </li>
          <Divider component="li" />
          <MenuItem component={Link} to="/me" onClick={() => setAnchor(null)}><EmojiEventsOutlined />Trophy cabinet</MenuItem>
          <MenuItem onClick={async () => { setAnchor(null); await signOut(); navigate('/signin', { replace: true }); }}><LogoutRounded />Sign out</MenuItem>
        </Menu>
      </div>
    </header>
    <main className="ath-main" id="ath-main" tabIndex={-1}><Outlet /></main>
  </div>;
}

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, InputAdornment, Snackbar, TextField } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import SensorsRounded from '@mui/icons-material/SensorsRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import EventSchedule from './EventSchedule';
import EventControl from './admin/EventControl';
import UserManagement from './admin/UserManagement';
import RecordManagement from './admin/RecordManagement';
import { SportIcon, sportStyle } from '../components/SportIcon';
import ThemeToggle from '../components/ThemeToggle';
import { useAppData } from '../context/AppDataContext';
import { creatableSports, eventStatus, formatEventDate, statusLabel, type CreatableSport } from '../data/competitionLifecycle';
import type { Competition } from '../types/domain';
import './admin/admin.css';

type View = 'events' | 'users' | 'records';
type EventFilter = 'ALL' | 'LIVE' | 'READY' | 'REGISTRATION_OPEN' | 'COMPLETED';
const filters: [EventFilter, string][] = [
  ['ALL', 'All events'], ['LIVE', 'Live'], ['READY', 'Ready to start'],
  ['REGISTRATION_OPEN', 'Registration open'], ['COMPLETED', 'Completed'],
];
const navigation = [
  { id: 'events', title: 'Events', icon: CalendarMonthOutlined, href: '/admin' },
  { id: 'users', title: 'User management', icon: GroupsOutlined, href: '/admin?view=users' },
  { id: 'records', title: 'Records', icon: EmojiEventsOutlined, href: '/admin?view=records' },
];

function EventStatus({ event, today }: { event: Competition; today: string }) {
  const status = eventStatus(event, today);
  return <span className={`ops-badge ops-badge-${status.toLowerCase()}`}><i />{statusLabel[status]}</span>;
}

export default function AdminPage() {
  const { currentUser, signOut, users, categories, competitions, registrations, records, today, firebaseEnabled, importDemo } = useAppData();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<EventFilter>('ALL');
  const [search, setSearch] = useState('');
  const [create, setCreate] = useState<{ sport?: CreatableSport } | null>(null);
  const [notice, setNotice] = useState('');
  const [importing, setImporting] = useState(false);
  const view: View = params.get('view') === 'users' ? 'users' : params.get('view') === 'records' ? 'records' : 'events';
  const selected = view === 'events' ? competitions.find(c => c.id === params.get('event')) : undefined;
  const currentNav = navigation.find(item => item.id === view)!;
  if (!currentUser) return null;

  const counts = new Map<string, number>();
  registrations.forEach(entry => { if (entry.status === 'REGISTERED') counts.set(entry.competitionId, (counts.get(entry.competitionId) ?? 0) + 1); });
  const live = competitions.filter(c => c.status === 'LIVE').length;
  const ready = competitions.filter(c => eventStatus(c, today) === 'READY').length;
  const registered = registrations.filter(r => r.status === 'REGISTERED').length;
  const activeUsers = users.filter(u => u.role === 'ATHLETE' && u.status === 'ACTIVE').length;
  const orderedStatuses: ReturnType<typeof eventStatus>[] = ['LIVE', 'READY', 'REGISTRATION_OPEN', 'UPCOMING', 'DRAFT', 'COMPLETED', 'CANCELLED'];
  const visible = competitions.filter(c => (filter === 'ALL' || eventStatus(c, today) === filter) &&
    c.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) =>
    orderedStatuses.indexOf(eventStatus(a, today)) - orderedStatuses.indexOf(eventStatus(b, today)) ||
    b.registrationDeadline.localeCompare(a.registrationDeadline));
  const openEvent = (id: string) => {
    setParams({ event: id });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const showEvents = () => setParams({});

  return <div className="ops-shell">
    <aside className="ops-sidebar">
      <Link className="ops-brand" to="/admin" aria-label="Off Pace admin home">
        <span className="ops-brand-mark"><BoltRounded /></span><span>OFF<span className="ops-brand-dot">·</span>PACE<small>ADMIN WORKSPACE</small></span>
      </Link>
      <nav className="ops-nav" aria-label="Admin workspace">
        {navigation.map(({ id, title, icon: Icon, href }) => <Link key={id} to={href} aria-current={view === id ? 'page' : undefined}>
          <Icon /><span>{title}</span>{view === id && <ChevronRightRounded className="ops-nav-arrow" />}
        </Link>)}
      </nav>
      <div className="ops-sidebar-bottom">
        <div className="ops-account">
          <span className="ops-avatar">{currentUser.firstName[0]}{currentUser.lastName[0]}</span>
          <span className="ops-account-copy"><strong>{currentUser.firstName} {currentUser.lastName}</strong><small>Administrator</small></span>
          <button type="button" className="ops-icon-button" aria-label="Sign out" title="Sign out" onClick={async () => { await signOut(); navigate('/signin', { replace: true }); }}><LogoutRounded /></button>
        </div>
      </div>
    </aside>
    <main className="ops-main">
      <header className="ops-topbar">
        <div className="ops-breadcrumb"><span>Workspace</span><ChevronRightRounded /><strong>{currentNav.title}</strong>{selected && <><ChevronRightRounded /><span>{selected.name}</span></>}</div>
        <div className="ops-topbar-actions">
          <div className="ops-today"><CalendarMonthOutlined />{formatEventDate(today, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <ThemeToggle />
        </div>
      </header>
      <div className="ops-content">
        {view === 'events' && !selected && <>
          <section className="ops-hero" aria-labelledby="ops-title">
            <div className="ops-hero-copy">
              <h1 id="ops-title">Event control room</h1>
              <p>Open registration, run live competitions, and publish results.</p>
              <Button className="ops-primary" startIcon={<AddRounded />} onClick={() => setCreate({})}>Create event</Button>
            </div>
          </section>
          {firebaseEnabled && !competitions.length && !records.length && users.length === 1 && <section className="ops-panel ops-inset" style={{ marginTop: 16 }}>
            <div className="ops-panel-heading"><div><h2>Load sample data</h2><p>Start with the demo athletes, competitions, scores, records, and trophies.</p></div></div>
            <Button className="ops-secondary" disabled={importing} onClick={async () => {
              setImporting(true);
              if (await importDemo()) setNotice('Sample data imported.');
              setImporting(false);
            }}>Import sample data</Button>
          </section>}
          <section className="ops-metrics" aria-label="Workspace at a glance">
            {[
              { title: 'Total events', value: competitions.length, icon: CalendarMonthOutlined, color: 'lime' },
              { title: 'Live now', value: live, icon: SensorsRounded, color: 'peach' },
              { title: 'Registrations', value: registered, icon: EventAvailableOutlined, color: 'blue' },
              { title: 'Active athletes', value: activeUsers, icon: GroupsOutlined, color: 'violet' },
            ].map(({ title, value, icon: Icon, color }) => <div className="ops-metric" key={title}>
              <div><span>{title}</span><strong>{value}</strong></div>
              <span className={`pace-sport-icon pace-tone-${color}`}><Icon fontSize="inherit" /></span>
            </div>)}
          </section>
          <div className="ops-dashboard-grid">
            <section className="ops-panel" aria-labelledby="ops-events-title">
              <div className="ops-panel-heading ops-events-heading">
                <div><h2 id="ops-events-title">Events</h2><p>{ready ? `${ready} ${ready === 1 ? 'event ready' : 'events ready'} to start` : 'Manage your competitions'}</p></div>
                <TextField className="ops-search" size="small" value={search} placeholder="Search events" onChange={e => setSearch(e.target.value)}
                  inputProps={{ 'aria-label': 'Search events' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} />
              </div>
              <div className="ops-filters" aria-label="Filter events">
                {filters.map(([id, label]) => <button type="button" key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label}</button>)}
              </div>
              {visible.length ? <div className="ops-table-scroll"><table className="ops-table">
                <thead><tr><th scope="col">Event</th><th scope="col">Status</th><th scope="col">Deadline</th><th scope="col" className="ops-table-registrations">Registered</th><th scope="col"><span className="ops-sr-only">Actions</span></th></tr></thead>
                <tbody>{visible.map(event => <tr key={event.id}>
                  <td><Link className="ops-event-link" to={`/admin?event=${encodeURIComponent(event.id)}`}><SportIcon sport={event.eventId} />
                    <span><strong>{event.name}</strong><small>{sportStyle(event.eventId).format} · {event.quarter} {event.year}</small></span></Link></td>
                  <td><EventStatus event={event} today={today} /></td>
                  <td className="ops-table-date">{formatEventDate(event.registrationDeadline, { day: 'numeric', month: 'short' })}</td>
                  <td className="ops-table-registrations">{counts.get(event.id) ?? 0}</td>
                  <td><Link className="ops-icon-button" to={`/admin?event=${encodeURIComponent(event.id)}`} aria-label={`Manage ${event.name}`}><ArrowForwardRounded /></Link></td>
                </tr>)}</tbody>
              </table></div> : <div className="ops-empty"><CalendarMonthOutlined /><strong>No events found</strong><p>{search || filter !== 'ALL' ? 'Try a different search or filter.' : 'Create an event to open registration.'}</p></div>}
            </section>
            <aside className="ops-dashboard-side">
              <section className="ops-panel ops-catalog" aria-labelledby="ops-sports-title">
                <div className="ops-panel-heading"><div><h2 id="ops-sports-title">Event types</h2><p>Select a sport to create an event.</p></div></div>
                {creatableSports.map(id => <button className="ops-catalog-row" key={id} type="button" onClick={() => setCreate({ sport: id })}>
                  <SportIcon sport={id} /><span><strong>{categories.find(c => c.id === id)?.name}</strong><small>{sportStyle(id).format}</small></span><ChevronRightRounded />
                </button>)}
              </section>
              {ready > 0 && <button className="ops-ready-callout" type="button" onClick={() => { setSearch(''); setFilter('READY'); }}>
                <span className="ops-ready-mark"><BoltRounded /></span><span><strong>Ready to go live</strong><small>{ready} {ready === 1 ? 'event has' : 'events have'} closed registration.</small></span><ArrowForwardRounded />
              </button>}
            </aside>
          </div>
        </>}
        {selected && <EventControl key={selected.id} event={selected} onBack={showEvents} notify={setNotice} />}
        {view === 'users' && <UserManagement notify={setNotice} />}
        {view === 'records' && <RecordManagement notify={setNotice} />}
      </div>
    </main>
    {create && <EventSchedule initialSport={create.sport} onClose={() => setCreate(null)} onCreated={id => {
      setCreate(null); openEvent(id); setNotice('Event created. Registration is open.');
    }} />}
    <Snackbar open={Boolean(notice)} message={notice} autoHideDuration={3500} onClose={() => setNotice('')} />
  </div>;
}

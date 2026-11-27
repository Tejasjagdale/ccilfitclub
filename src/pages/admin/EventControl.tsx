import { useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, TextField } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import StopRounded from '@mui/icons-material/StopRounded';
import { useAppData } from '../../context/AppDataContext';
import { canStart, eventDay, eventStatus, formatEventDate, registrationOpen, statusLabel, validDay } from '../../data/competitionLifecycle';
import type { Competition, AppUser } from '../../types/domain';
import { SportIcon, sportStyle } from '../../components/SportIcon';
import EventScoring from './EventScoring';

interface Props { event: Competition; onBack: () => void; notify: (message: string) => void }

export default function EventControl({ event, onBack, notify }: Props) {
  const { categories, registrations, users, today, setCompetitionStatus, deleteEdition, updateDeadline } = useAppData();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [confirm, setConfirm] = useState<'end' | 'cancel' | 'delete' | null>(null);
  const [editing, setEditing] = useState(false);
  const [deadline, setDeadline] = useState(event.registrationDeadline);
  const [error, setError] = useState('');
  const category = categories.find(c => c.id === event.eventId);
  const status = eventStatus(event, today);
  const live = event.status === 'LIVE';
  const finished = event.status === 'COMPLETED';
  const cancelled = event.status === 'CANCELLED';
  const editable = event.status === 'DRAFT' || event.status === 'REGISTRATION_OPEN' || event.status === 'UPCOMING';
  const canOpen = event.status === 'DRAFT' && event.registrationDeadline >= today;
  const ready = canStart(event, today);
  const ids = new Set(registrations.filter(r => r.competitionId === event.id && r.status === 'REGISTERED').map(r => r.userId));
  const entrants = users.filter(u => ids.has(u.id));
  const step = finished ? 3 : live ? 2 : ready || event.status === 'UPCOMING' ? 1 : 0;
  const deadlineLabel = formatEventDate(event.registrationDeadline);
  const lifecycle = [
    { title: 'Registration', description: ready || live || finished ? 'Closed' : registrationOpen(event, today) ? `Open until ${deadlineLabel}` : statusLabel[status] },
    { title: 'Ready to start', description: 'Deadline has passed' },
    { title: 'Live scoring', description: event.startAt && (live || finished) ? formatEventDate(event.startAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Record results' },
    { title: 'Completed', description: finished && event.endAt ? formatEventDate(event.endAt) : 'Finalize results' },
  ];

  function saveDeadline(e: FormEvent) {
    e.preventDefault();
    if (!validDay(deadline) || deadline < eventDay() || deadline < event.registrationStart) {
      setError('Choose a date on or after today and the registration opening date.');
      return;
    }
    updateDeadline(event.id, deadline);
    setEditing(false);
    notify('Registration deadline updated.');
  }

  function confirmAction() {
    if (confirm === 'end') { setCompetitionStatus(event.id, 'COMPLETED'); notify('Event ended. Results are final.'); }
    if (confirm === 'cancel') { setCompetitionStatus(event.id, 'CANCELLED'); notify('Event cancelled.'); }
    if (confirm === 'delete') { deleteEdition(event.id); onBack(); notify('Event deleted.'); }
    setConfirm(null);
  }

  return <>
    <button className="ops-back" type="button" onClick={onBack}><ArrowBackRounded /> All events</button>
    <section className="ops-panel ops-event-header">
      <div className="ops-event-title">
        <SportIcon sport={event.eventId} />
        <div><div className="ops-event-kicker">{category?.name ?? event.eventId} · {event.quarter} {event.year}</div><h1>{event.name}</h1></div>
        <span className={`ops-badge ops-badge-${status.toLowerCase()}`}><i />{statusLabel[status]}</span>
      </div>
      <div className="ops-event-actions">
        {canOpen && <Button className="ops-primary" onClick={() => { setCompetitionStatus(event.id, 'REGISTRATION_OPEN'); notify('Registration is open.'); }}>Open registration</Button>}
        {ready && <Button className="ops-primary" startIcon={<PlayArrowRounded />} onClick={() => {
          if (canStart(event, eventDay())) { setCompetitionStatus(event.id, 'LIVE'); notify('Event is live.'); }
        }}>Start event</Button>}
        {live && <Button className="ops-primary" startIcon={<StopRounded />} onClick={() => setConfirm('end')}>End event</Button>}
        <button type="button" className="ops-icon-button" aria-label="More event actions" aria-haspopup="menu" aria-expanded={Boolean(menu)} onClick={e => setMenu(e.currentTarget)}><MoreHorizRounded /></button>
        <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)} className="ops-popup">
          {editable && <MenuItem onClick={() => { setDeadline(event.registrationDeadline); setEditing(true); setError(''); setMenu(null); }}>Edit registration deadline</MenuItem>}
          {!finished && !cancelled && <MenuItem onClick={() => { setConfirm('cancel'); setMenu(null); }}>Cancel event</MenuItem>}
          <MenuItem onClick={() => { setConfirm('delete'); setMenu(null); }}>Delete event</MenuItem>
        </Menu>
      </div>
      <div className="ops-event-facts">
        <span><CalendarMonthOutlined /><span>Registration deadline <strong>{deadlineLabel} · IST</strong></span></span>
        <span><GroupsOutlined /><span>Registered <strong>{entrants.length}{event.capacity > 0 ? ` / ${event.capacity}` : ''}</strong></span></span>
      </div>
    </section>
    {!cancelled && <ol className="ops-lifecycle" aria-label="Event progress">
      {lifecycle.map(({ title, description }, index) => <li key={title} className={index < step ? 'ops-step-done' : index === step ? 'ops-step-current' : undefined} aria-current={index === step ? 'step' : undefined}>
        <span className="ops-step-mark">{index < step ? <CheckRounded /> : index + 1}</span><span><strong>{title}</strong><small>{description}</small></span>
      </li>)}
    </ol>}
    <div className="ops-detail-grid">
      <EventScoring event={event} category={category} entrants={entrants} notify={notify} />
      <div className="ops-dashboard-side">
        <section className="ops-panel ops-inset" aria-labelledby="ops-roster-title">
          <div className="ops-panel-heading"><div><h2 id="ops-roster-title">Participants</h2><p>{entrants.length} registered</p></div></div>
          {entrants.length ? entrants.map(user => <div className="ops-roster-row" key={user.id}>
            <span className="ops-avatar">{user.firstName[0]}{user.lastName[0]}</span><span><strong>{user.firstName} {user.lastName}</strong><small>{user.employeeId}</small></span>
          </div>) : <p className="ops-muted">No registrations yet.</p>}
        </section>
        {finished && <RecordForm event={event} entrants={entrants} notify={notify} />}
      </div>
    </div>
    {editing && <Dialog open onClose={() => setEditing(false)} fullWidth maxWidth="xs" PaperProps={{ className: 'ops-dialog' }} aria-labelledby="ops-deadline-title">
      <form onSubmit={saveDeadline}>
        <DialogTitle id="ops-deadline-title">Edit registration deadline</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" className="ops-form-alert">{error}</Alert>}
          <TextField type="date" label="Registration deadline" fullWidth required value={deadline} onChange={e => setDeadline(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: event.registrationStart > today ? event.registrationStart : today }} helperText="Registration closes at the end of this date (IST)." />
        </DialogContent>
        <DialogActions><Button className="ops-secondary" onClick={() => setEditing(false)}>Cancel</Button><Button className="ops-primary" type="submit">Save deadline</Button></DialogActions>
      </form>
    </Dialog>}
    {confirm && <Dialog open onClose={() => setConfirm(null)} fullWidth maxWidth="xs" PaperProps={{ className: 'ops-dialog' }} aria-labelledby="ops-confirm-event-title">
      <DialogTitle id="ops-confirm-event-title">{confirm === 'end' ? 'End event?' : confirm === 'cancel' ? 'Cancel event?' : 'Delete event?'}</DialogTitle>
      <DialogContent><DialogContentText>{confirm === 'end' ? `Results for ${event.name} will become final and score entry will close.` :
        confirm === 'cancel' ? `This will close ${event.name} to registrations and score entry.` : `This permanently removes ${event.name}, its registrations, scores, and records.`}</DialogContentText></DialogContent>
      <DialogActions><Button className="ops-secondary" onClick={() => setConfirm(null)}>Go back</Button>
        <Button className={confirm === 'end' ? 'ops-primary' : 'ops-danger'} onClick={confirmAction}>{confirm === 'end' ? 'End event' : confirm === 'cancel' ? 'Cancel event' : 'Delete event'}</Button></DialogActions>
    </Dialog>}
    </>
}

function RecordForm({ event, entrants, notify }: { event: Competition; entrants: AppUser[]; notify: Props['notify'] }) {
  const { currentUser, users, results, saveRecord } = useAppData();
  const [holder, setHolder] = useState('');
  const [metric, setMetric] = useState('');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'ALL_TIME' | 'UNIQUE'>('ALL_TIME');
  const competingIds = new Set([...entrants.map(u => u.id), ...results.filter(r => r.competitionId === event.id).map(r => r.userId)]);
  const athletes = users.filter(u => competingIds.has(u.id));
  if (!athletes.length) return null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser || !holder || !metric.trim() || !value.trim()) return;
    saveRecord({ eventId: event.eventId, competitionId: event.id, userId: holder, recordType: type, metric: metric.trim(), value: value.trim(), achievedAt: event.endAt ? eventDay(new Date(event.endAt)) : eventDay(), note: note.trim(), verifiedBy: currentUser.id });
    setMetric(''); setValue(''); setNote('');
    notify('Record published.');
  }

  return <section className="ops-panel ops-inset">
    <div className="ops-panel-heading"><div><h2>Verify a record</h2><p>Recognize a standout {sportStyle(event.eventId).format.toLowerCase()} result.</p></div></div>
    <form onSubmit={submit} className="ops-stacked-form">
      <TextField select label="Record holder" value={holder} onChange={e => setHolder(e.target.value)} required>{athletes.map(u => <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>)}</TextField>
      <TextField select label="Record type" value={type} onChange={e => setType(e.target.value as typeof type)}><MenuItem value="ALL_TIME">All-time record</MenuItem><MenuItem value="UNIQUE">Unique achievement</MenuItem></TextField>
      <TextField label="Record metric" value={metric} onChange={e => setMetric(e.target.value)} required />
      <TextField label="Record value" value={value} onChange={e => setValue(e.target.value)} required />
      <TextField label="Verification note" value={note} onChange={e => setNote(e.target.value)} />
      <Button className="ops-secondary" type="submit">Publish record</Button>
    </form>
  </section>;
}

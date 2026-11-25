import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Chip, MenuItem, Paper, Select, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import Layout from '../components/Layout';
import type { Competition } from '../types/domain';
import { useAppData } from '../context/AppDataContext';

const statusLabel: Record<string,string> = { DRAFT: 'Draft', REGISTRATION_OPEN: 'Registration open', UPCOMING: 'Upcoming', LIVE: 'Live now', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
export default function EventDetailPage() {
  const { eventId = '' } = useParams(); const [searchParams] = useSearchParams(); const { categories, competitions, registrations, results, records, users, currentUser, register } = useAppData();
  const category = categories.find(c => c.id === eventId); const eventCompetitions = competitions.filter(c => c.eventId === eventId).sort((a,b) => b.startAt.localeCompare(a.startAt));
  const requestedCompetition = eventCompetitions.find(c => c.id === searchParams.get('competition'));
  const quarters = Array.from(new Set(eventCompetitions.map(c => `${c.quarter} ${c.year}`)));
  const [quarter, setQuarter] = useState(requestedCompetition ? `${requestedCompetition.quarter} ${requestedCompetition.year}` : (quarters[0] ?? ''));
  const quarterCompetitions = useMemo(() => eventCompetitions.filter(c => `${c.quarter} ${c.year}` === quarter), [eventCompetitions, quarter]);
  const [selectedId, setSelectedId] = useState(requestedCompetition?.id ?? '');
  useEffect(() => { if (requestedCompetition) { setQuarter(`${requestedCompetition.quarter} ${requestedCompetition.year}`); setSelectedId(requestedCompetition.id); } }, [requestedCompetition?.id]);
  const selected = eventCompetitions.find(c => c.id === selectedId) ?? quarterCompetitions[0] ?? eventCompetitions[0];
  if (!category) return <Layout><Typography>Event not found.</Typography></Layout>;
  const allCompetitionResults = selected ? results.filter(r => r.competitionId === selected.id) : [];
  const finalResults = allCompetitionResults.filter(r => r.stage.toUpperCase() === 'FINAL');
  const latestStage = allCompetitionResults.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.stage;
  const activeStage = finalResults.length ? 'FINAL' : latestStage;
  const selectedResults = allCompetitionResults.filter(r => r.stage === activeStage).sort((a,b) => a.rank - b.rank);
  const recordList = records.filter(r => r.eventId === eventId).sort((a,b) => a.recordType.localeCompare(b.recordType));
  const registered = selected && currentUser ? registrations.some(r => r.competitionId === selected.id && r.userId === currentUser.id && r.status === 'REGISTERED') : false;
  const entrants = registrations.filter(r => r.competitionId === selected?.id && r.status === 'REGISTERED');
  const full = !!selected && entrants.length >= selected.capacity;
  const canRegister = Boolean(!full && selected && currentUser?.role === 'ATHLETE' && currentUser.status === 'ACTIVE' && selected.status === 'REGISTRATION_OPEN' && new Date(`${selected.registrationDeadline}T23:59:59`) >= new Date() && (!selected.registrationStart || new Date(`${selected.registrationStart}T00:00:00`) <= new Date()));
  const personName = (id: string) => { const u = users.find(x => x.id === id); return u ? `${u.firstName} ${u.lastName}` : 'Unknown athlete'; };
  return <Layout>
    <Button component={RouterLink} to={currentUser?.role === 'ADMIN' ? '/events' : '/'} startIcon={<ArrowBackRoundedIcon />} className="back-link">{currentUser?.role === 'ADMIN' ? 'All events' : 'Back home'}</Button>
    <Box className="event-detail-hero"><span className="category-icon">{category.icon}</span><Box sx={{ flex: 1 }}><Typography className="overline">EVENT CATEGORY</Typography><Typography variant="h1">{category.name}</Typography><Typography color="text.secondary">{category.description}</Typography></Box><Chip label={category.format} className="quiet-chip" /></Box>
    <Box className="event-history-controls"><Box><Typography className="overline">COMPETITION ARCHIVE</Typography><Typography variant="h2">Quarterly results & standings</Typography></Box><Select size="small" value={quarter} onChange={e => { setQuarter(e.target.value); setSelectedId(''); }} displayEmpty>{quarters.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}</Select></Box>
    {quarterCompetitions.length > 1 && <Box className="competition-pills">{quarterCompetitions.map(c => <Button key={c.id} onClick={() => setSelectedId(c.id)} className={(selected?.id === c.id || (!selectedId && selected?.id === quarterCompetitions[0].id)) ? 'pill-active' : ''}>{c.name}</Button>)}</Box>}
    {selected ? <>
      <Paper className="competition-detail-card" elevation={0}>
        <Box className="competition-detail-title"><Box><Typography className="overline">{selected.quarter} {selected.year} COMPETITION</Typography><Typography variant="h4">{selected.name}</Typography></Box><Chip label={statusLabel[selected.status]} className={selected.status === 'LIVE' ? 'live-chip' : selected.status === 'COMPLETED' ? 'complete-chip' : 'quiet-chip'} /></Box>
        <Typography color="text.secondary" fontSize={13}>{selected.description}</Typography>
        <Box className="competition-meta"><span>◷ {new Date(selected.startAt).toLocaleString()}</span><span>⌖ {selected.venue}</span><span>♙ {registrations.filter(r => r.competitionId === selected.id && r.status === 'REGISTERED').length}/{selected.capacity} registered</span></Box>
        {selected.status === 'REGISTRATION_OPEN' && <Box className="registration-banner"><Box><b>Registration is open</b><span>Last date: {new Date(`${selected.registrationDeadline}T00:00:00`).toLocaleDateString()}</span></Box>{!currentUser ? <Button component={RouterLink} to="/signin" state={{ from: `/events/${eventId}` }} variant="contained">Sign in to register</Button> : registered ? <Chip label="You're registered" className="status-active" /> : <Button variant="contained" disabled={!canRegister} onClick={() => currentUser && register(selected.id, currentUser.id)}>{full ? 'Event full' : 'Register for event'}</Button>}</Box>}
      </Paper>
      <Paper className="competition-detail-card" elevation={0}><Typography variant="h5">Participants · {entrants.length}</Typography>
        {entrants.length ? <Box sx={{display:'flex', flexWrap:'wrap',gap:1, mt:2}}>{entrants.map(r=><Chip key={r.id} label={personName(r.userId) + (r.userId === currentUser?.id ? ' (you)' : '')}/>)}</Box> : <Typography color="text.secondary">No registrations yet.</Typography>}
      </Paper>
      <Box className="results-record-grid"><Paper className="results-panel" elevation={0}><Box className="panel-heading"><Box><Typography className="overline">OFFICIAL RESULTS</Typography><Typography variant="h5">{selected.status === 'LIVE' ? 'Live standings' : 'Final standings'}{activeStage ? ` · ${activeStage}` : ''}</Typography></Box>{selected.status === 'LIVE' && <Chip label="LIVE" className="live-chip" />}</Box>
        {selectedResults.length ? <Box className="standings-table"><Box className="standings-head"><span>RANK</span><span>ATHLETE</span><span>{selectedResults[0].scoreLabel.toUpperCase()}</span><span>STAGE</span></Box>{selectedResults.map(row => <Box className="standing-row" key={row.id}><b className={`rank rank-${row.rank}`}>{row.rank === 1 ? '01' : String(row.rank).padStart(2,'0')}</b><Box><b>{personName(row.userId)}</b><small>{row.detail}</small></Box><strong>{row.score}</strong><span>{row.stage}</span></Box>)}</Box> : <Box className="empty-results"><span>⌁</span><b>No scores published yet</b><small>Standings will appear here when the admin updates results.</small></Box>}
      </Paper>
      <Paper className="records-panel" elevation={0}><Box className="panel-heading"><Box><Typography className="overline">ACROSS ALL EDITIONS</Typography><Typography variant="h5">Discipline records</Typography></Box><WorkspacePremiumRoundedIcon /></Box>
        {recordList.length ? recordList.map(record => <Box className="record-item" key={record.id}><span className="record-medal"><WorkspacePremiumRoundedIcon /></span><Box><Chip label={record.recordType.replace('_',' ')} size="small" className="record-type-chip"/><b>{record.metric}</b><small>{personName(record.userId)} · {new Date(`${record.achievedAt}T00:00:00`).toLocaleDateString()}</small><p>{record.note}</p></Box><strong>{record.value}</strong></Box>) : <Typography color="text.secondary" fontSize={13}>No official records have been verified for this event yet.</Typography>}
      </Paper></Box>
    </> : <Paper className="empty-results" elevation={0}><b>No competitions in this quarter</b><small>When an admin schedules a competition, it will appear here.</small></Paper>}
  </Layout>;
}

import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Paper, Tab, Tabs, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { dateAfter } from '../data/dateAfter';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';

type HomeTab = 'live' | 'previous';
const statusLabel: Record<string, string> = { LIVE: 'Live now', REGISTRATION_OPEN: 'Registration open', UPCOMING: 'Upcoming', COMPLETED: 'Completed' };

export default function HomePage() {
  const { competitions, categories, users, results, registrations, currentUser, register } = useAppData();
  const [tab, setTab] = useState<HomeTab>('live');
  const liveEvents = useMemo(() => competitions
    .filter(competition => ['LIVE', 'REGISTRATION_OPEN', 'UPCOMING'].includes(competition.status))
    .sort((a, b) => {
      const priority = (status: string) => status === 'LIVE' ? 0 : status === 'REGISTRATION_OPEN' ? 1 : 2;
      return priority(a.status) - priority(b.status) || a.startAt.localeCompare(b.startAt);
    }), [competitions]);
  const previousEvents = useMemo(() => competitions
    .filter(competition => competition.status === 'COMPLETED')
    .sort((a, b) => b.startAt.localeCompare(a.startAt)), [competitions]);
  const displayedEvents = tab === 'live' ? liveEvents : previousEvents;

  return <Layout>
    <Box className="home-events-page">
      <Box className="home-events-heading">
        <Typography variant="h1">Events</Typography>
        <Typography color="text.secondary">Follow current competitions and revisit past results.</Typography>
      </Box>
      <Paper className="home-events-panel" elevation={0}>
        <Tabs value={tab} onChange={(_, value: HomeTab) => setTab(value)} className="home-events-tabs" aria-label="Events">
          <Tab value="live" label="Current events" />
          <Tab value="previous" label="Previous events" />
        </Tabs>
        <Box className="home-events-list">
          {displayedEvents.length ? displayedEvents.map(competition => {
            const category = categories.find(item => item.id === competition.eventId);
            const isLive = competition.status === 'LIVE';
            const roster = registrations.filter(r => r.competitionId === competition.id && r.status === 'REGISTERED');
            const joined = roster.some(r => r.userId === currentUser?.id);
            const today = dateAfter(0);
            const open = competition.status === 'REGISTRATION_OPEN';
            const status = roster.length >= competition.capacity ? 'Event full' : today > competition.registrationDeadline ? 'Registration closed' : today < competition.registrationStart ? 'Registration opens ' + competition.registrationStart : 'Register';
            const editionResults = results.filter(r => r.competitionId === competition.id);
            const winningStage = category?.format === 'KNOCKOUT' || editionResults.some(r => r.stage.toUpperCase() === 'FINAL') ? 'FINAL' : 'FINISH';
            const winners = editionResults.filter(r => r.rank === 1 && r.stage.trim().toUpperCase() === winningStage).map(r => users.find(u => u.id === r.userId)).filter(Boolean);
            return <Paper className={joined ? 'home-event-row joined-edition' : 'home-event-row'} elevation={0} key={competition.id}>
              <Box className="home-event-date"><strong>{new Date(competition.startAt).getDate()}</strong><span>{new Date(competition.startAt).toLocaleString('en', { month: 'short' })}</span></Box>
              <Box className="home-event-copy">
                <Typography className="home-event-name">{competition.name}</Typography>
                <Typography className="home-event-meta">{category?.name ?? competition.eventId}<span>·</span>{competition.quarter} {competition.year}<span>·</span>{competition.venue}</Typography>
                {competition.status === 'COMPLETED' && <Typography fontWeight={700}>{winners.length ? 'Winner · ' + winners.map(u => u!.firstName + ' ' + u!.lastName).join(', ') : 'Winner pending'}</Typography>}
                <Typography variant="caption">{roster.length} registered</Typography>
              </Box>
              <Box sx={{display:'flex', alignItems:'center', flexWrap:'wrap', gap:1}}>
              {joined ? <Chip size="small" label="Already registered" sx={{bgcolor:'#e2edd1',color:'#36462b'}}/> : open && currentUser?.role === 'ATHLETE' && currentUser.status === 'ACTIVE' ?
                <Button size="small" variant="contained" disabled={status !== 'Register'} onClick={() => register(competition.id,currentUser.id)}>{status}</Button> :
              <Chip label={statusLabel[competition.status] ?? competition.status} className={isLive ? 'home-event-live-chip' : 'home-event-status-chip'} size="small" />}
              <Button component={RouterLink} to={`/events/${competition.eventId}?competition=${encodeURIComponent(competition.id)}`} className="home-event-open" endIcon={<ArrowForwardRoundedIcon />}>Show more</Button></Box>
            </Paper>;
          }) : <Box className="home-events-empty"><EventOutlinedIcon /><Typography fontWeight={600}>{tab === 'live' ? 'No live or upcoming events' : 'No previous events yet'}</Typography><Typography color="text.secondary" fontSize={13}>{tab === 'live' ? 'New competitions will appear here when published.' : 'Completed competitions will appear here.'}</Typography></Box>}
        </Box>
      </Paper>
    </Box>
  </Layout>;
}

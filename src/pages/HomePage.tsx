import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Paper, Tab, Tabs, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';

type HomeTab = 'live' | 'previous';
const statusLabel: Record<string, string> = { LIVE: 'Live now', REGISTRATION_OPEN: 'Registration open', UPCOMING: 'Upcoming', COMPLETED: 'Completed' };

export default function HomePage() {
  const { competitions, categories } = useAppData();
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
          <Tab value="live" label="Live events" />
          <Tab value="previous" label="Previous events" />
        </Tabs>
        <Box className="home-events-list">
          {displayedEvents.length ? displayedEvents.map(competition => {
            const category = categories.find(item => item.id === competition.eventId);
            const isLive = competition.status === 'LIVE';
            return <Paper className="home-event-row" elevation={0} key={competition.id}>
              <Box className="home-event-date"><strong>{new Date(competition.startAt).getDate()}</strong><span>{new Date(competition.startAt).toLocaleString('en', { month: 'short' })}</span></Box>
              <Box className="home-event-copy">
                <Typography className="home-event-name">{competition.name}</Typography>
                <Typography className="home-event-meta">{category?.name ?? competition.eventId}<span>·</span>{competition.quarter} {competition.year}<span>·</span>{competition.venue}</Typography>
              </Box>
              <Chip label={statusLabel[competition.status] ?? competition.status} className={isLive ? 'home-event-live-chip' : 'home-event-status-chip'} size="small" />
              <Button component={RouterLink} to={`/events/${competition.eventId}?competition=${encodeURIComponent(competition.id)}`} className="home-event-open" endIcon={<ArrowForwardRoundedIcon />}>View</Button>
            </Paper>;
          }) : <Box className="home-events-empty"><EventOutlinedIcon /><Typography fontWeight={600}>{tab === 'live' ? 'No live or upcoming events' : 'No previous events yet'}</Typography><Typography color="text.secondary" fontSize={13}>{tab === 'live' ? 'New competitions will appear here when published.' : 'Completed competitions will appear here.'}</Typography></Box>}
        </Box>
      </Paper>
    </Box>
  </Layout>;
}

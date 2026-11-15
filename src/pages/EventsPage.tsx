import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Paper, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';

export default function EventsPage() {
  const { categories, competitions, registrations, results, currentUser } = useAppData();
  const isAthlete = currentUser?.role === 'ATHLETE';
  const openCompetitions = competitions.filter(c => c.status === 'REGISTRATION_OPEN').sort((a, b) => a.startAt.localeCompare(b.startAt));
  return <Layout>
    {isAthlete ? <>
      <Box className="page-heading">
        <Typography className="overline">JOIN THE NEXT CHALLENGE</Typography>
        <Typography variant="h1">Open for registration</Typography>
        <Typography color="text.secondary">Browse competitions accepting registrations and reserve your place.</Typography>
      </Box>
      {openCompetitions.length ? <Box className="category-grid">
        {openCompetitions.map(competition => {
          const category = categories.find(item => item.id === competition.eventId);
          return <Paper component={RouterLink} to={`/events/${competition.eventId}?competition=${encodeURIComponent(competition.id)}`} key={competition.id} className="category-card" elevation={0}>
            <Box className="category-top"><span className="category-icon">{category?.icon ?? '🏅'}</span><Chip size="small" label="REGISTRATION OPEN" className="live-chip" /></Box>
            <Typography variant="h5">{competition.name}</Typography>
            <Typography color="text.secondary">{category?.name ?? competition.eventId} · {competition.quarter} {competition.year}</Typography>
            <Typography color="text.secondary">{new Date(competition.startAt).toLocaleDateString()} · {competition.venue}</Typography>
            <Box className="category-bottom"><span>VIEW EVENT & REGISTER</span><ArrowForwardRoundedIcon /></Box>
          </Paper>;
        })}
      </Box> : <Paper className="home-events-empty" elevation={0}><Typography fontWeight={600}>No competitions are open for registration right now</Typography><Typography color="text.secondary" fontSize={13}>Check back soon. New competitions will appear here when registration opens.</Typography></Paper>}
    </> : <>
    <Box className="page-heading"><Typography className="overline">THE SPORTS CALENDAR</Typography><Typography variant="h1">Events</Typography><Typography color="text.secondary">Six fixed disciplines. New competitions every quarter. One place for every result and record.</Typography></Box>
    <Box className="competition-summary-grid"><Paper elevation={0}><b>{competitions.length}</b><span>Competitions created</span></Paper><Paper elevation={0}><b>{competitions.filter(c => c.status === 'LIVE').length}</b><span>Live right now</span></Paper><Paper elevation={0}><b>{registrations.filter(r => r.status === 'REGISTERED').length}</b><span>Registrations</span></Paper><Paper elevation={0}><b>{results.length}</b><span>Results published</span></Paper></Box>
    <Box className="category-grid">{categories.map((category) => {
      const items = competitions.filter(c => c.eventId === category.id);
      const live = items.some(c => c.status === 'LIVE');
      return <Paper component={RouterLink} to={`/events/${category.id}`} key={category.id} className="category-card" elevation={0}>
        <Box className="category-top"><span className="category-icon">{category.icon}</span><Chip size="small" label={live ? 'LIVE NOW' : `${items.length} COMPETITIONS`} className={live ? 'live-chip' : 'quiet-chip'} /></Box>
        <Typography variant="h5">{category.name}</Typography><Typography color="text.secondary">{category.description}</Typography>
        <Box className="category-bottom"><span>{category.format.replace('_', ' ')} FORMAT</span><ArrowForwardRoundedIcon /></Box>
      </Paper>;
    })}</Box>
    </>}
  </Layout>;
}

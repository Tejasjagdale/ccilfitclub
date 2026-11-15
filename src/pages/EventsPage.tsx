import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Paper, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';

export default function EventsPage() {
  const { categories, competitions, registrations, results } = useAppData();
  return <Layout>
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
  </Layout>;
}

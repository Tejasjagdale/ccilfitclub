import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Layout from '../components/Layout';
import events from '../data/events.json';
import people from '../data/people.json';

export default function HomePage() {
  const activeAthletes = people.filter((person) => person.status === 'ACTIVE');
  return (
    <Layout>
      <Box className="home-intro">
        <Typography className="overline">OFFICE SPORTS & SOCIAL CLUB</Typography>
        <Typography variant="h1">A little more play.<br /><span>A lot more team.</span></Typography>
        <Typography className="intro-copy">A place to find company events, join in, and see who else is taking part.</Typography>
        <Box className="intro-actions">
          <Button component={RouterLink} to="/events" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>Browse events</Button>
          <Button component={RouterLink} to="/athletes" variant="text">Meet the athletes</Button>
        </Box>
      </Box>
      <Box className="overview-grid">
        <Paper className="overview-card" elevation={0}>
          <Box className="overview-icon"><EventOutlinedIcon /></Box>
          <Typography className="metric">{events.length}</Typography>
          <Typography className="metric-label">Upcoming events</Typography>
          <Button component={RouterLink} to="/events" endIcon={<ArrowForwardRoundedIcon />}>View events</Button>
        </Paper>
        <Paper className="overview-card" elevation={0}>
          <Box className="overview-icon"><GroupsOutlinedIcon /></Box>
          <Typography className="metric">{activeAthletes.length}</Typography>
          <Typography className="metric-label">Active athletes</Typography>
          <Button component={RouterLink} to="/athletes" endIcon={<ArrowForwardRoundedIcon />}>View athletes</Button>
        </Paper>
      </Box>
      <Box className="section-heading">
        <Box><Typography className="overline">COMING UP</Typography><Typography variant="h2">Next events</Typography></Box>
        <Button component={RouterLink} to="/events">All events <ArrowForwardRoundedIcon sx={{ ml: .5, fontSize: 17 }} /></Button>
      </Box>
      <Box className="upcoming-list">
        {events.slice(0,3).map((event) => <Paper className="upcoming-row" elevation={0} key={event.id}>
          <Box className="date-block"><b>{event.day}</b><span>{event.month}</span></Box>
          <Box className="upcoming-info"><Typography fontWeight={700}>{event.title}</Typography><Typography color="text.secondary" fontSize={13}>{event.category} · {event.venue}</Typography></Box>
          <Typography className="upcoming-count">{event.participants} joined</Typography>
          <ArrowForwardRoundedIcon className="row-arrow" />
        </Paper>)}
      </Box>
    </Layout>
  );
}
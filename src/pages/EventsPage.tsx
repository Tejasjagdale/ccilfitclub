import { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, TextField, Typography } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Layout from '../components/Layout';
import events from '../data/events.json';

export default function EventsPage() {
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => events.filter((event) => category === 'All' || event.category === category), [category]);
  return (
    <Layout>
      <Box className="page-heading">
        <Typography className="overline">THE CALENDAR</Typography>
        <Typography variant="h1">Events</Typography>
        <Typography color="text.secondary">See what's coming up and find something to take part in.</Typography>
      </Box>
      <Box className="filter-row">
        <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ width: 190 }}>
          {['All','Fitness','Strategy','Outdoor'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <Typography color="text.secondary" fontSize={13}>{filtered.length} events</Typography>
      </Box>
      <Box className="event-list">
        {filtered.map((event) => <Paper className="event-list-card" elevation={0} key={event.id}>
          <Box className="event-date"><b>{event.day}</b><span>{event.month}</span><small>2026</small></Box>
          <Box className="event-main">
            <Box className="event-title-line"><Typography variant="h5">{event.title}</Typography><Chip label={event.status} size="small" className={event.status === 'Almost full' ? 'status-warn' : 'status-open'} /></Box>
            <Typography color="text.secondary" fontSize={13} sx={{ mt: .7 }}>{event.description}</Typography>
            <Box className="event-details">
              <span><ScheduleOutlinedIcon />{event.date} · {event.time}</span>
              <span><PlaceOutlinedIcon />{event.venue}</span>
              <span><GroupsOutlinedIcon />{event.participants}/{event.capacity} registered</span>
            </Box>
          </Box>
        </Paper>)}
        {filtered.length === 0 && <Typography color="text.secondary">No events in this category yet.</Typography>}
      </Box>
    </Layout>
  );
}
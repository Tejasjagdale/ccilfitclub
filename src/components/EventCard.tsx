import { Box, Button, Chip, Typography } from '@mui/material';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import type events from '../data/events.json';

type EventItem = (typeof events)[number];

export default function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  return (
    <Box className={`event-card event-card-${index}`}>
      <Box className="event-image">
        <Chip label={event.category} size="small" className="image-chip" />
        <Box className="date-tile"><strong>{event.day}</strong><span>{event.month}</span></Box>
        <span className="image-arrow"><ArrowOutwardRoundedIcon /></span>
      </Box>
      <Box className="event-card-body">
        <Box className="event-meta"><span className={`event-status ${event.status === 'Almost full' ? 'almost-full' : ''}`}><i />{event.status}</span><span>{event.date}</span></Box>
        <Typography variant="h5" className="event-title">{event.title}</Typography>
        <Typography className="event-description">{event.description}</Typography>
        <Box className="event-location"><PlaceOutlinedIcon /><span>{event.venue}</span></Box>
        <Box className="event-card-footer">
          <Box className="event-people"><Groups2OutlinedIcon /><b>{event.participants}</b><span>going</span></Box>
          <Button className="event-explore" endIcon={<ArrowOutwardRoundedIcon />}>Explore</Button>
        </Box>
      </Box>
    </Box>
  );
}

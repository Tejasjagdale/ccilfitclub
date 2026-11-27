import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, Button, Chip, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import TrophyCabinet, { TrophyArtwork, type CabinetAward } from '../components/TrophyCabinet';
import { SportIcon } from '../components/SportIcon';
import { useAppData } from '../context/AppDataContext';
import { athleteName, eventLink } from '../data/athleteEvents';

type Award = CabinetAward;

const awardsByAthlete: Record<string, Award[]> = {
  'u-1': [
    { id: 'a1', event: 'HYROX: The Gauntlet', title: 'Engine of the Day', date: '22 Nov 2026', type: 'hyrox', placement: 'Top 10', detail: 'Recognised for an outstanding all-round performance across the run and functional workout stations.', finish: '01:08:42' },
    { id: 'a2', event: 'City Miles 5K', title: 'Personal Best', date: '06 Dec 2026', type: 'run', placement: '00:24:18', detail: 'A new personal best at the City Miles 5K.' },
  ],
  'u-2': [
    { id: 'b1', event: 'The Office Chess Open', title: 'Queen’s Gambit', date: '29 Nov 2026', type: 'chess', placement: '2nd place', detail: 'A podium finish after a sharp final match in the Office Chess Open.' },
    { id: 'b2', event: 'City Miles 5K', title: 'Race Finisher', date: '06 Dec 2026', type: 'run', placement: 'Finisher', detail: 'Completed the City Miles 5K with the office crew.' },
  ],
  'u-3': [
    { id: 'c1', event: 'HYROX: The Gauntlet', title: 'Team Power', date: '22 Nov 2026', type: 'hyrox', placement: 'Team award', detail: 'Recognised for teamwork, consistency and determination throughout the challenge.' },
  ],
  'u-4': [
    { id: 'd1', event: 'The Office Chess Open', title: 'Chess Contender', date: '29 Nov 2026', type: 'chess', placement: 'Finalist', detail: 'Reached the final stage of the Office Chess Open.' },
  ],
  'u-5': [
    { id: 'e1', event: 'City Miles 5K', title: 'First 5K', date: '06 Dec 2026', type: 'run', placement: 'Finisher', detail: 'Completed a first 5K event and earned a place in the cabinet.' },
  ],
};

export default function AthleteProfilePage() {
  const { employeeId } = useParams();
  const { currentUser, users, registrations, competitions } = useAppData();
  const person = employeeId ? users.find(user => user.employeeId.toLowerCase() === employeeId.toLowerCase() &&
    user.role === 'ATHLETE' && user.status !== 'REMOVED') : currentUser;
  const [selectedAwardId, setSelectedAwardId] = useState<string | null>(null);

  if (!person) return <><Link className="ath-back-link" to="/athletes"><ArrowBackRounded />Athletes</Link><h1 className="ath-page-title">Athlete not found</h1></>;

  const own = person.id === currentUser?.id;
  const awards = awardsByAthlete[person.id] ?? [];
  const selectedAward = awards.find(award => award.id === selectedAwardId);
  const joined = new Set(registrations.filter(row => row.userId === person.id && row.status === 'REGISTERED').map(row => row.competitionId));
  const joinedEvents = competitions.filter(event => joined.has(event.id));

  return <div className="ath-profile">
    <Link className="ath-back-link" to="/"><ArrowBackRounded />All events</Link>
    <div className="ath-profile-title"><h1 className="ath-page-title">{own ? 'Trophy cabinet' : athleteName(person) + '’s trophy cabinet'}</h1></div>
    <div className="ath-cabinet">
      <TrophyCabinet awards={awards} collectionName={own ? 'Your awards' : 'Awards'}
        selectedAwardId={selectedAwardId} onAwardSelect={award => setSelectedAwardId(award.id)} />
    </div>

    {joinedEvents.length > 0 && <section className="ath-panel ath-profile-registrations" aria-labelledby="ath-profile-events">
      <div className="ath-panel-heading"><span className="ath-section-icon ath-icon-registration"><CalendarMonthOutlined /></span>
        <h2 id="ath-profile-events">Registered events</h2><span className="ath-section-count">{joinedEvents.length}</span>
      </div>
      <ul>{joinedEvents.map(event => <li key={event.id}>
        <Link to={eventLink(event)}><SportIcon sport={event.eventId} /><strong>{event.name}</strong><ArrowForwardRounded /></Link>
      </li>)}</ul>
    </section>}

    <Dialog open={Boolean(selectedAward)} onClose={() => setSelectedAwardId(null)} maxWidth="sm" fullWidth
      PaperProps={{ className: 'award-dialog' }} aria-labelledby="award-dialog-title">
      {selectedAward && <>
        <Box className="award-dialog-head">
          <IconButton onClick={() => setSelectedAwardId(null)} aria-label="Return trophy to cabinet"><CloseRounded /></IconButton>
        </Box>
        <DialogContent className="award-dialog-content">
          <Box className={`award-dialog-visual award-dialog-visual-${selectedAward.type}`}>
            <span className="award-dialog-spotlight" />
            <TrophyArtwork type={selectedAward.type} />
          </Box>
          <Typography id="award-dialog-title" variant="h4">{selectedAward.title}</Typography>
          <Typography className="award-dialog-event">{selectedAward.event} · {selectedAward.date}</Typography>
          <Chip icon={<EmojiEventsRounded />} label={selectedAward.placement} className="award-dialog-chip" />
          <Typography className="award-dialog-detail">{selectedAward.detail}</Typography>
          {selectedAward.finish && <Box className="award-finish"><small>FINISH TIME</small><b>{selectedAward.finish}</b></Box>}
          <Button className="award-dialog-back" variant="outlined" onClick={() => setSelectedAwardId(null)}>Return to cabinet</Button>
        </DialogContent>
      </>}
    </Dialog>
  </div>;
}

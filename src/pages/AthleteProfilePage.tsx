import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Avatar, Box, Button, Chip, Dialog, DialogContent, IconButton, Paper, Tab, Tabs, Typography } from '@mui/material';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Layout from '../components/Layout';
import TrophyCabinet, { TrophyArtwork, type CabinetAward } from '../components/TrophyCabinet';
import people from '../data/people.json';

type Award = CabinetAward;

const awardsByEmployee: Record<string, Award[]> = {
  EMP001: [
    { id: 'a1', event: 'HYROX: The Gauntlet', title: 'Engine of the Day', date: '22 Nov 2026', type: 'hyrox', placement: 'Top 10', detail: 'Recognised for an outstanding all-round performance across the run and functional workout stations.', finish: '01:08:42' },
    { id: 'a2', event: 'City Miles 5K', title: 'Personal Best', date: '06 Dec 2026', type: 'run', placement: '00:24:18', detail: 'A new personal best at the City Miles 5K.' },
  ],
  EMP002: [
    { id: 'b1', event: 'The Office Chess Open', title: 'Queen’s Gambit', date: '29 Nov 2026', type: 'chess', placement: '2nd place', detail: 'A podium finish after a sharp final match in the Office Chess Open.' },
    { id: 'b2', event: 'City Miles 5K', title: 'Race Finisher', date: '06 Dec 2026', type: 'run', placement: 'Finisher', detail: 'Completed the City Miles 5K with the office crew.' },
  ],
  EMP003: [
    { id: 'c1', event: 'HYROX: The Gauntlet', title: 'Team Power', date: '22 Nov 2026', type: 'hyrox', placement: 'Team award', detail: 'Recognised for teamwork, consistency and determination throughout the challenge.' },
  ],
  EMP004: [
    { id: 'd1', event: 'The Office Chess Open', title: 'Chess Contender', date: '29 Nov 2026', type: 'chess', placement: 'Finalist', detail: 'Reached the final stage of the Office Chess Open.' },
  ],
  EMP005: [
    { id: 'e1', event: 'City Miles 5K', title: 'First 5K', date: '06 Dec 2026', type: 'run', placement: 'Finisher', detail: 'Completed a first 5K event and earned a place in the cabinet.' },
  ],
};

export default function AthleteProfilePage() {
  const { employeeId } = useParams();
  const person = people.find((item) => item.employeeId.toLowerCase() === (employeeId || '').toLowerCase());
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [profileTab, setProfileTab] = useState<'cabinet' | 'events'>('cabinet');
  const awards = useMemo(() => person ? (awardsByEmployee[person.employeeId] || []) : [], [person]);

  if (!person) return <Layout><Box className="page-heading"><Typography variant="h1">Athlete not found</Typography><Button component={RouterLink} to="/athletes">Back to athletes</Button></Box></Layout>;

  return <Layout>
    <Paper className="profile-card profile-hero" elevation={0}>
      <Avatar className="profile-avatar">{person.firstName[0]}{person.lastName[0]}</Avatar>
      <Box className="profile-heading">
        <Typography className="overline">ATHLETE PROFILE</Typography>
        <Typography variant="h1">{person.firstName} {person.lastName}</Typography>
        <Typography color="text.secondary">{person.employeeId} <span className="profile-dot">·</span> {person.team}</Typography>
      </Box>
      <Chip label={person.status} className={person.status === 'ACTIVE' ? 'status-active' : 'status-retired'} />
    </Paper>

    <Paper className="profile-tabs-shell" elevation={0}>
      <Tabs value={profileTab} onChange={(_, value: 'cabinet' | 'events') => setProfileTab(value)} className="profile-tabs" aria-label="Athlete profile sections">
        <Tab value="cabinet" icon={<EmojiEventsRoundedIcon />} iconPosition="start" label="Trophy cabinet" />
        <Tab value="events" icon={<EventOutlinedIcon />} iconPosition="start" label="Events participated" />
      </Tabs>
    </Paper>

    {profileTab === 'events' && <>
      <Box className="profile-section-heading tab-section-heading">
        <Box><Typography className="overline">SHOWING UP IS A WIN</Typography><Typography variant="h2">Events participated in</Typography></Box>
        <span className="section-count">{person.eventsJoined.length} EVENTS</span>
      </Box>
      <Box className="participation-list">
        {person.eventsJoined.length ? person.eventsJoined.map((event, index) => <Paper className="participation-item" elevation={0} key={event}><span className="participation-index">{String(index + 1).padStart(2, '0')}</span><Box className="participation-symbol"><EventOutlinedIcon /></Box><Box className="participation-copy"><b>{event}</b><small>Official event participation</small></Box><Chip label="Participated" size="small" /></Paper>) : <Typography color="text.secondary">No events joined yet.</Typography>}
      </Box>
    </>}

    {profileTab === 'cabinet' && <>
      <Box className="cabinet-heading tab-section-heading"><Box><Typography className="overline">BUILT ONE ACHIEVEMENT AT A TIME</Typography><Typography variant="h2">Trophy cabinet</Typography><Typography className="cabinet-subtitle">Every event leaves a mark. Every achievement earns its place.</Typography></Box><Box className="cabinet-total"><strong>{String(awards.length).padStart(2, '0')}</strong><span>AWARDS</span></Box></Box>
      <TrophyCabinet
        awards={awards}
        collectionName={`${person.firstName.toUpperCase()}’S COLLECTION`}
        selectedAwardId={selectedAward?.id ?? null}
        onAwardSelect={setSelectedAward}
      />
    </>}

    <Dialog
      open={Boolean(selectedAward)}
      onClose={() => setSelectedAward(null)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: 'award-dialog' }}
      aria-labelledby="award-dialog-title"
    >
      {selectedAward && <>
        <Box className="award-dialog-head">
          <Typography className="overline">ADDED TO THE CABINET</Typography>
          <IconButton onClick={() => setSelectedAward(null)} aria-label="Return trophy to cabinet"><CloseRoundedIcon /></IconButton>
        </Box>
        <DialogContent className="award-dialog-content">
          <Box className={`award-dialog-visual award-dialog-visual-${selectedAward.type}`}>
            <span className="award-dialog-spotlight" />
            <TrophyArtwork type={selectedAward.type} />
          </Box>
          <Typography id="award-dialog-title" variant="h4">{selectedAward.title}</Typography>
          <Typography className="award-dialog-event">{selectedAward.event} · {selectedAward.date}</Typography>
          <Chip icon={<EmojiEventsRoundedIcon />} label={selectedAward.placement} className="award-dialog-chip" />
          <Typography className="award-dialog-detail">{selectedAward.detail}</Typography>
          {selectedAward.finish && <Box className="award-finish"><small>FINISH TIME</small><b>{selectedAward.finish}</b></Box>}
          <Button className="award-dialog-back" variant="outlined" onClick={() => setSelectedAward(null)}>Return to cabinet</Button>
        </DialogContent>
      </>}
    </Dialog>
  </Layout>;
}

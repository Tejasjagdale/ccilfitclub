import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Chip, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useAppData } from '../context/AppDataContext';
import type { EventFormat } from '../types/domain';

import { dateAfter } from '../data/dateAfter';

export default function EventSchedule({ onCreated }: { onCreated: (id: string) => void }) {
  const { categories, createEdition } = useAppData();
  const [sport, setSport] = useState(categories[0].id);
  const [format, setFormat] = useState<EventFormat>('TIMED');
  const [error, setError] = useState('');
  const template = categories.find(category => category.id === sport);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) ?? '').trim();
    const startAt = field('start'), endAt = field('end');
    const registrationStart = field('open'), registrationDeadline = field('close');
    if (registrationStart > registrationDeadline || registrationDeadline > startAt.slice(0,10) || endAt <= startAt) {
      setError('Check the dates. Registration must close by the event date and the finish must follow the start.'); return;
    }
    const name = field('name'), venue = field('venue'), sportName = field('sportName');
    if (!name || !venue || (!template && !sportName)) { setError('Enter an edition name, venue and discipline.'); return; }
    if (!template && categories.some(c => c.name.toLowerCase() === sportName.toLowerCase())) { setError('Select the existing discipline to keep its records together.'); return; }
    const eventId = template?.id ?? crypto.randomUUID();
    const id = crypto.randomUUID();
    createEdition({ id, eventId, name, venue, description: field('description'), startAt, endAt, registrationStart, registrationDeadline,
      year: Number(startAt.slice(0,4)), quarter: 'Q' + Math.ceil(Number(startAt.slice(5,7))/3), status: 'DRAFT', capacity: Number(field('capacity')) },
      template ? undefined : { id: eventId, name: sportName, format, scoreLabel: field('metric') || 'Score', unit: format === 'TIMED' ? 'time' : 'points', icon: '◎', description: sportName });
    onCreated(id);
  }
  return <Paper className="admin-form-card" elevation={0}><Typography variant="h5" mb={3}>Create an edition</Typography>
    <Box component="form" onSubmit={submit} className="admin-form-grid">
      <TextField select label="Discipline" value={sport} onChange={e=>setSport(e.target.value)}>{categories.map(c=><MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}<MenuItem value="new">+ New discipline</MenuItem></TextField>
      {template && <Box sx={{alignSelf:'center'}}><Chip label={template.scoreLabel + ' · ' + template.format} /></Box>}
      {!template && <><TextField required name="sportName" label="Discipline name"/><TextField select label="Scoring format" value={format} onChange={e=>setFormat(e.target.value as EventFormat)}>{['TIMED','DISTANCE','POINTS','KNOCKOUT'].map(f=><MenuItem key={f} value={f}>{f}</MenuItem>)}</TextField><TextField name="metric" label="Score label" required placeholder="e.g. Distance in km"/></>}
      <TextField name="name" required label="Edition name" placeholder="e.g. Winter 5K"/><TextField name="venue" required label="Venue"/>
      <TextField name="start" required label="Starts" type="datetime-local" defaultValue={dateAfter(8)+'T09:00'}/><TextField name="end" required label="Ends" type="datetime-local" defaultValue={dateAfter(8)+'T12:00'}/>
      <TextField name="open" required label="Registration opens" type="date" defaultValue={dateAfter(0)}/><TextField name="close" required label="Registration closes" type="date" defaultValue={dateAfter(7)}/>
      <TextField name="capacity" required label="Participant limit" type="number" inputProps={{min:1,step:1}} defaultValue={32}/><TextField name="description" label="Event details" multiline/>
      {error && <Alert severity="error" className="span-two">{error}</Alert>}<Box className="span-two"><Button type="submit" variant="contained">Create draft</Button></Box>
    </Box></Paper>;
}

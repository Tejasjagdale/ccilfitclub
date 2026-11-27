import { useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { useAppData } from '../context/AppDataContext';
import { creatableSports, type CreatableSport } from '../data/competitionLifecycle';
import { SportIcon, sportStyle } from '../components/SportIcon';

interface Props { initialSport?: CreatableSport; onClose: () => void; onCreated: (id: string) => void }

export default function EventSchedule({ initialSport, onClose, onCreated }: Props) {
  const { categories, createCompetition, today } = useAppData();
  const [sport, setSport] = useState<CreatableSport | ''>(initialSport ?? '');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!sport) { setError('Select an event type.'); return; }
    const id = createCompetition(sport, deadline);
    if (!id) { setError('Choose a registration deadline of today or later.'); return; }
    onCreated(id);
  }

  return <Dialog open onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ className: 'ops-dialog' }} aria-labelledby="ops-create-event-title">
    <form onSubmit={submit}>
      <DialogTitle id="ops-create-event-title">Create event</DialogTitle>
      <IconButton className="ops-dialog-close" onClick={onClose} aria-label="Close"><CloseRounded /></IconButton>
      <DialogContent>
        {error && <Alert severity="error" className="ops-form-alert">{error}</Alert>}
        <fieldset className="ops-sport-fieldset">
          <legend>Event type</legend>
          <div className="ops-sport-options">
            {creatableSports.map(id => <label className="ops-sport-option" key={id}>
              <input type="radio" name="sport" value={id} checked={sport === id} onChange={() => { setSport(id); setError(''); }} />
              <span className="ops-sport-option-body">
                <SportIcon sport={id} />
                <span><strong>{categories.find(c => c.id === id)?.name}</strong><small>{sportStyle(id).format}</small></span>
              </span>
            </label>)}
          </div>
        </fieldset>
        <TextField fullWidth label="Registration deadline" type="date" required InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }} value={deadline} onChange={e => { setDeadline(e.target.value); setError(''); }}
          helperText="Registration opens immediately and closes at the end of this date (IST)." />
      </DialogContent>
      <DialogActions><Button className="ops-secondary" onClick={onClose}>Cancel</Button>
        <Button className="ops-primary" type="submit" endIcon={<ArrowForwardRounded />}>Create event</Button></DialogActions>
    </form>
  </Dialog>;
}

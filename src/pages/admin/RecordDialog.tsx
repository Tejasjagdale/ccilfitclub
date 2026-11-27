import { useState, type FormEvent } from 'react';
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import { useAppData } from '../../context/AppDataContext';
import { athleteName } from '../../data/athleteEvents';
import { formatEventDate } from '../../data/competitionLifecycle';
import { matchesAllTimeMetric, recordEditionDate, recordHolderIds } from '../../data/eventRecords';
import type { Competition, RecordEntry } from '../../types/domain';

interface Props {
  initialEdition?: Competition;
  initialType?: RecordEntry['recordType'];
  onClose: () => void;
  onSaved: (type: RecordEntry['recordType'], replaced: boolean) => void;
}

export default function RecordDialog({ initialEdition, initialType = 'ALL_TIME', onClose, onSaved }: Props) {
  const { categories, competitions, users, registrations, results, records, saveRecord, today } = useAppData();
  const [entry, setEntry] = useState<RecordEntry>(() => ({
    eventId: initialEdition?.eventId ?? '', competitionId: initialEdition?.id, userId: '',
    recordType: initialType, metric: '', value: '',
    achievedAt: initialEdition ? recordEditionDate(initialEdition) : '', note: '',
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const editions = competitions.filter(c => c.eventId === entry.eventId && c.status === 'COMPLETED')
    .sort((a, b) => recordEditionDate(b).localeCompare(recordEditionDate(a)));
  const editionHolders = entry.competitionId ? recordHolderIds(entry.competitionId, registrations, results) : null;
  const holders = users.filter(user => user.role === 'ATHLETE' && (editionHolders ? editionHolders.has(user.id) : user.status !== 'REMOVED'));
  const existing = records.find(record => matchesAllTimeMetric(record, entry));
  const allTime = entry.recordType === 'ALL_TIME';

  function update(fields: Partial<RecordEntry>) {
    setEntry(current => ({ ...current, ...fields }));
    setError('');
  }

  function chooseEdition(id: string) {
    const edition = editions.find(item => item.id === id);
    update({ competitionId: edition?.id, userId: '', achievedAt: edition ? recordEditionDate(edition) : '' });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const failure = await saveRecord(entry, existing?.id);
    setSaving(false);
    if (failure) { setError(failure); return; }
    onSaved(entry.recordType, Boolean(existing));
  }

  return <Dialog open onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ className: 'ops-dialog ops-record-dialog' }}
    aria-labelledby="ops-record-dialog-title" aria-describedby="ops-record-dialog-help">
    <form onSubmit={submit}>
      <DialogTitle id="ops-record-dialog-title">Add record</DialogTitle>
      <IconButton className="ops-dialog-close" onClick={onClose} aria-label="Close record form"><CloseRounded /></IconButton>
      <DialogContent>
        <p className="ops-record-dialog-help" id="ops-record-dialog-help">All-time records appear on the athlete dashboard. Every record appears on its sport’s event page.</p>
        {error && <Alert severity="error" className="ops-form-alert">{error}</Alert>}
        <div className="ops-record-form">
          <TextField select label="Sport" value={entry.eventId} required onChange={event => update({
            eventId: event.target.value, competitionId: undefined, userId: '', achievedAt: '',
          })}>
            {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>)}
          </TextField>
          <TextField select label="Record type" value={entry.recordType} onChange={event => update({ recordType: event.target.value as RecordEntry['recordType'] })}>
            <MenuItem value="ALL_TIME">All-time record</MenuItem><MenuItem value="UNIQUE">Unique achievement</MenuItem>
          </TextField>
          <TextField select label="Event edition" value={entry.competitionId ?? (allTime && entry.eventId ? 'manual' : '')} disabled={!entry.eventId}
            required={!allTime} onChange={event => chooseEdition(event.target.value)}
            helperText={!entry.eventId ? 'Choose a sport first.' : allTime ? 'Use manual entry for a historical record.' : 'Choose a completed event.'}>
            {allTime && <MenuItem value="manual">Manual entry</MenuItem>}
            {!allTime && editions.length === 0 && <MenuItem disabled value="">No completed editions</MenuItem>}
            {editions.map(edition => <MenuItem value={edition.id} key={edition.id}>{edition.name} · {formatEventDate(recordEditionDate(edition))}</MenuItem>)}
          </TextField>
          <TextField type="date" label="Date achieved" value={entry.achievedAt} required
            InputLabelProps={{ shrink: true }} inputProps={{ max: today }} onChange={event => update({ achievedAt: event.target.value })} />
          <Autocomplete className="ops-span-two" options={holders} disabled={!entry.eventId || (!allTime && !entry.competitionId)}
            value={holders.find(holder => holder.id === entry.userId) ?? null} isOptionEqualToValue={(a, b) => a.id === b.id}
            getOptionLabel={holder => `${athleteName(holder)} · ${holder.employeeId}`}
            noOptionsText={holders.length ? 'No matching athletes' : 'No athletes available for this edition'}
            onChange={(_, holder) => update({ userId: holder?.id ?? '' })}
            renderInput={params => <TextField {...params} label="Record holder" required placeholder="Search by name or employee ID" />} />
          <TextField label="Record name" value={entry.metric} required placeholder="Fastest HYROX finish"
            inputProps={{ maxLength: 120 }} onChange={event => update({ metric: event.target.value })} />
          <TextField label="Performance" value={entry.value} required placeholder="01:08:42 or 7 wins"
            inputProps={{ maxLength: 100 }} onChange={event => update({ value: event.target.value })} />
          <TextField className="ops-span-two" label="Verification note (optional)" value={entry.note} multiline minRows={2}
            inputProps={{ maxLength: 1000 }} onChange={event => update({ note: event.target.value })} />
          {existing && <Alert severity="warning" className="ops-span-two">
            The current record is <strong>{existing.value}</strong> from {formatEventDate(existing.achievedAt)}. Saving this entry will replace it.
          </Alert>}
        </div>
      </DialogContent>
      <DialogActions>
        <Button className="ops-secondary" onClick={onClose}>Cancel</Button>
        <Button className="ops-primary" type="submit" disabled={saving} startIcon={<EmojiEventsOutlined />}>{existing ? 'Replace record' : 'Publish record'}</Button>
      </DialogActions>
    </form>
  </Dialog>;
}

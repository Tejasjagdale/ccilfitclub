import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, InputAdornment, TextField } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { SportIcon } from '../../components/SportIcon';
import { useAppData } from '../../context/AppDataContext';
import { athleteName } from '../../data/athleteEvents';
import { formatEventDate } from '../../data/competitionLifecycle';
import type { EventRecord } from '../../types/domain';
import RecordDialog from './RecordDialog';
import './records.css';

const recordTypes = [
  { id: 'ALL_TIME', label: 'All-time records' },
  { id: 'UNIQUE', label: 'Unique achievements' },
] as const;

export default function RecordManagement({ notify }: { notify: (message: string) => void }) {
  const { categories, competitions, records, users } = useAppData();
  const [type, setType] = useState<EventRecord['recordType']>('ALL_TIME');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const categoryNames = new Map(categories.map(category => [category.id, category.name]));
  const editions = new Map(competitions.map(edition => [edition.id, edition]));
  const people = new Map(users.map(user => [user.id, user]));
  const query = search.trim().toLowerCase();
  const rows = records.filter(record => record.recordType === type).map(record => {
    const user = people.get(record.userId);
    return {
      record, holder: athleteName(user), employeeId: user?.employeeId,
      sport: categoryNames.get(record.eventId) ?? record.eventId,
      edition: record.competitionId ? editions.get(record.competitionId) : undefined,
    };
  }).filter(({ record, holder, employeeId, sport, edition }) =>
    [record.metric, record.value, holder, employeeId, sport, edition?.name].some(text => text?.toLowerCase().includes(query))
  ).sort((a, b) => b.record.achievedAt.localeCompare(a.record.achievedAt) || a.sport.localeCompare(b.sport));

  return <>
    <div className="ops-page-title">
      <div><h1>Records</h1><p>Publish all-time records and unique achievements for athletes to see.</p></div>
      <Button className="ops-primary ops-on-light" startIcon={<AddRounded />} onClick={() => setEditing(true)}>Add record</Button>
    </div>
    <section className="ops-panel" aria-labelledby="ops-records-ledger">
      <div className="ops-panel-heading ops-events-heading">
        <div><h2 id="ops-records-ledger">Published records</h2><p>{rows.length} {rows.length === 1 ? 'record' : 'records'}</p></div>
        <TextField className="ops-search ops-record-search" size="small" placeholder="Search records" value={search}
          onChange={event => setSearch(event.target.value)} inputProps={{ 'aria-label': 'Search records' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} />
      </div>
      <div className="ops-filters" aria-label="Record type">
        {recordTypes.map(({ id, label }) => <button type="button" key={id} aria-pressed={type === id} onClick={() => setType(id)}>{label}</button>)}
      </div>
      {rows.length ? <div className="ops-table-scroll">
        <table className="ops-table ops-record-table" aria-label="Published records" role="table">
          <thead role="rowgroup"><tr role="row">
            <th scope="col" role="columnheader">Record</th><th scope="col" role="columnheader">Record holder</th><th scope="col" role="columnheader">Performance</th>
            <th scope="col" role="columnheader">Date achieved</th><th scope="col" role="columnheader">Event edition</th>
          </tr></thead>
          <tbody role="rowgroup">{rows.map(({ record, holder, employeeId, sport, edition }) => <tr key={record.id} role="row">
            <td role="cell" className="ops-record-identity"><div className="ops-event-link"><SportIcon sport={record.eventId} />
              <div><strong>{record.metric}</strong><small>{sport}</small>
                {record.note && <details className="ops-record-note"><summary>Verification note</summary><p>{record.note}</p></details>}
              </div></div>
            </td>
            <td role="cell"><span className="ops-record-mobile-label" aria-hidden="true">Record holder</span><strong>{holder}</strong>{employeeId && <small>{employeeId}</small>}</td>
            <td role="cell"><span className="ops-record-mobile-label" aria-hidden="true">Performance</span><b className="ops-record-value">{record.value}</b></td>
            <td role="cell"><span className="ops-record-mobile-label" aria-hidden="true">Date achieved</span><time dateTime={record.achievedAt}>{formatEventDate(record.achievedAt)}</time></td>
            <td role="cell"><span className="ops-record-mobile-label" aria-hidden="true">Event edition</span>
              {edition ? <Link className="ops-record-edition-link" to={`/admin?event=${encodeURIComponent(edition.id)}`}>{edition.name}</Link>
                : record.competitionId ? 'Edition unavailable' : <span className="ops-badge">Manual entry</span>}
            </td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="ops-empty"><EmojiEventsOutlined /><strong>{query ? 'No matching records' : 'No records published yet'}</strong>
        <p>{query ? 'Try a different sport, record name, or athlete.' : 'Use Add record to publish the first one.'}</p></div>}
    </section>
    {editing && <RecordDialog initialType={type} onClose={() => setEditing(false)} onSaved={(nextType, replaced) => {
      setType(nextType); setSearch(''); setEditing(false); notify(replaced ? 'Record replaced.' : 'Record published.');
    }} />}
  </>;
}

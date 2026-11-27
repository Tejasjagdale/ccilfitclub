import { useState, type FormEvent } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, TextField } from '@mui/material';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { useAppData } from '../../context/AppDataContext';
import type { AppUser } from '../../types/domain';

const emptyUser = { firstName: '', lastName: '', employeeId: '' };

export default function UserManagement({ notify }: { notify: (message: string) => void }) {
  const { users, addUser, removeUser } = useAppData();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [person, setPerson] = useState(emptyUser);
  const [removing, setRemoving] = useState<AppUser | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const roster = users.filter(user => user.status !== 'REMOVED');
  const visible = roster.filter(user => `${user.firstName} ${user.lastName} ${user.employeeId}`.toLowerCase().includes(search.trim().toLowerCase()));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const employeeId = person.employeeId.trim().toUpperCase();
    if (!person.firstName.trim() || !person.lastName.trim() || !employeeId) {
      setError('Enter a first name, last name, and employee ID.');
      return;
    }
    if (roster.some(user => user.employeeId.trim().toUpperCase() === employeeId)) { setError('That employee ID is already in use.'); return; }
    setSaving(true);
    const saved = await addUser(person);
    setSaving(false);
    if (!saved) { setError('The employee could not be added. Check the employee ID and try again.'); return; }
    setSearch('');
    setCreating(false);
    notify('Employee added.');
  }

  return <>
    <div className="ops-page-title"><div><h1>User management</h1><p>Manage the employees who can access OFF·PACE.</p></div>
      <Button className="ops-primary ops-on-light" startIcon={<PersonAddAlt1Outlined />} onClick={() => { setPerson(emptyUser); setError(''); setCreating(true); }}>Add user</Button>
    </div>
    <section className="ops-panel" aria-labelledby="ops-directory-title">
      <div className="ops-panel-heading ops-events-heading">
        <div><h2 id="ops-directory-title">User directory</h2><p>{roster.length} {roster.length === 1 ? 'account' : 'accounts'}</p></div>
        <TextField size="small" className="ops-search" placeholder="Search name or ID" value={search} onChange={e => setSearch(e.target.value)}
          inputProps={{ 'aria-label': 'Search name or ID' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} />
      </div>
      {visible.length > 0 ? <div className="ops-table-scroll"><table className="ops-table ops-user-table">
        <thead><tr><th scope="col">Name</th><th scope="col">Employee ID</th><th scope="col">Access</th><th scope="col"><span className="ops-sr-only">Actions</span></th></tr></thead>
        <tbody>{visible.map((u, index) => <tr key={u.id}>
          <td><span className="ops-event-link"><span className={`ops-avatar pace-tone-${['lime', 'blue', 'violet', 'peach'][index % 4]}`}>{u.firstName[0]}{u.lastName[0]}</span><strong>{u.firstName} {u.lastName}</strong></span></td>
          <td className="ops-user-id">{u.employeeId}</td>
          <td><span className={`ops-badge ${u.role === 'ADMIN' ? 'ops-badge-ready' : u.status === 'ACTIVE' ? 'ops-badge-registration_open' : ''}`}><i />{u.role === 'ADMIN' ? 'Administrator' : u.status === 'RETIRED' ? 'Retired' : 'Athlete'}</span></td>
          <td>{u.role === 'ATHLETE' && <button type="button" className="ops-icon-button ops-remove" aria-label={`Remove ${u.firstName} ${u.lastName}`} title="Remove user" onClick={() => setRemoving(u)}><DeleteOutlineRounded /></button>}</td>
        </tr>)}</tbody>
      </table></div> : <div className="ops-empty"><GroupsOutlined /><strong>No users match your search</strong><p>Try a different name or employee ID.</p></div>}
    </section>
    {creating && <Dialog open onClose={() => setCreating(false)} fullWidth maxWidth="xs" PaperProps={{ className: 'ops-dialog' }} aria-labelledby="ops-add-user-title">
      <form onSubmit={submit}>
        <DialogTitle id="ops-add-user-title">Add user</DialogTitle>
        <DialogContent className="ops-dialog-fields">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField fullWidth label="First name" autoFocus required inputProps={{ maxLength: 64 }} value={person.firstName} onChange={e => setPerson({ ...person, firstName: e.target.value })} />
          <TextField fullWidth label="Last name" required inputProps={{ maxLength: 64 }} value={person.lastName} onChange={e => setPerson({ ...person, lastName: e.target.value })} />
          <TextField fullWidth label="Employee ID" required inputProps={{ maxLength: 32 }} value={person.employeeId} onChange={e => setPerson({ ...person, employeeId: e.target.value.toUpperCase() })} helperText="The employee uses this ID to sign in." />
        </DialogContent>
        <DialogActions><Button className="ops-secondary" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" className="ops-primary" disabled={saving}>Add user</Button></DialogActions>
      </form>
    </Dialog>}
    {removing && <Dialog open onClose={() => setRemoving(null)} fullWidth maxWidth="xs" PaperProps={{ className: 'ops-dialog' }} aria-labelledby="ops-remove-user-title">
      <DialogTitle id="ops-remove-user-title">Remove user?</DialogTitle>
      <DialogContent><DialogContentText>{removing.firstName} {removing.lastName} will lose sign-in access and be withdrawn from upcoming events. Live and completed event history will be retained.</DialogContentText></DialogContent>
      <DialogActions><Button className="ops-secondary" onClick={() => setRemoving(null)}>Cancel</Button><Button className="ops-danger" disabled={saving} onClick={async () => {
        setSaving(true);
        const saved = await removeUser(removing.id);
        setSaving(false);
        if (saved) { setRemoving(null); notify('Employee removed.'); }
      }}>Remove user</Button></DialogActions>
    </Dialog>}
  </>;
}

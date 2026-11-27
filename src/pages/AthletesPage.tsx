import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Chip, Paper, TextField, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useAppData } from '../context/AppDataContext';

export default function AthletesPage() {
  const { users } = useAppData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const filtered = useMemo(() => users.filter((person) =>
    person.role === 'ATHLETE' && person.status !== 'REMOVED' && (status === 'ALL' || person.status === status) &&
    `${person.firstName} ${person.lastName} ${person.employeeId} ${person.team}`.toLowerCase().includes(search.toLowerCase())
  ), [users, search, status]);
  return (
    <>
      <Box className="page-heading">
        <Typography className="overline">THE PEOPLE</Typography>
        <Typography variant="h1">Athletes</Typography>
        <Typography color="text.secondary">Find colleagues, see who's active, and open an athlete profile.</Typography>
      </Box>
      <Box className="directory-tools">
        <TextField size="small" placeholder="Search name, employee ID or team" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
        <Box className="status-filters">
          {['ALL','ACTIVE','RETIRED'].map((item) => <Chip key={item} label={item === 'ALL' ? 'Everyone' : item} onClick={() => setStatus(item)} className={status === item ? 'filter-selected' : ''} />)}
        </Box>
      </Box>
      <Paper className="athlete-table" elevation={0}>
        <Box className="athlete-table-head"><span>EMPLOYEE</span><span>TEAM</span><span>STATUS</span><span /></Box>
        {filtered.map((person, index) => <Box className="athlete-row" component={RouterLink} to={`/athletes/${encodeURIComponent(person.employeeId || person.id)}`} key={person.id}>
          <Box className="athlete-name-cell">
            <Avatar className={`athlete-avatar tone-${index % 5}`}>{person.firstName[0]}{person.lastName[0]}</Avatar>
            <Box><b>{person.firstName} {person.lastName}</b><small>{person.employeeId}</small></Box>
          </Box>
          <span className="team-cell">{person.team}</span>
          <Box><Chip size="small" label={person.status} className={person.status === 'ACTIVE' ? 'status-active' : 'status-retired'} /></Box>
          <span className="view-profile">View profile →</span>
        </Box>)}
        {filtered.length === 0 && <Box className="no-results">No athletes match your search.</Box>}
      </Paper>
    </>
  );
}

import { useState, type FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';

export default function RegisterPage() {
  const { users, addUser } = useAppData(); const navigate = useNavigate();
  const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState(''); const [employeeId, setEmployeeId] = useState(''); const [error, setError] = useState('');
  const submit = (e: FormEvent) => { e.preventDefault(); if (users.some(u => u.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) { setError('That employee ID is already registered. Try signing in.'); return; } addUser({ firstName, lastName, employeeId: employeeId.trim().toUpperCase(), status: 'ACTIVE', role: 'ATHLETE', department: '', team: '' }); navigate('/signin', { state: { registered: true } }); };
  return <Layout><Box className="auth-page"><Paper className="auth-card" elevation={0}><Typography className="overline">JOIN THE GROUP</Typography><Typography variant="h1">Athlete registration</Typography><Typography color="text.secondary" fontSize={13}>Create your athlete profile using your company details.</Typography>
    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    <Box component="form" onSubmit={submit} sx={{ mt: 3 }}><Typography className="form-label">First name</Typography><TextField fullWidth placeholder="First name" size="small" value={firstName} onChange={e => setFirstName(e.target.value)} required/><Typography className="form-label">Last name</Typography><TextField fullWidth placeholder="Last name" size="small" sx={{ mt: 1 }} value={lastName} onChange={e => setLastName(e.target.value)} required/><Typography className="form-label">Employee ID</Typography><TextField fullWidth placeholder="e.g. EMP006" size="small" sx={{ mt: 1 }} value={employeeId} onChange={e => setEmployeeId(e.target.value.toUpperCase())} required/><Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Create athlete profile</Button></Box>
    <Typography className="auth-foot">Already registered? <RouterLink to="/signin">Sign in</RouterLink></Typography><Typography className="auth-status-note">New registrations default to Athlete + Active. Admins can update role and status.</Typography>
  </Paper></Box></Layout>;
}

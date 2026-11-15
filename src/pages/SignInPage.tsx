import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';

export default function SignInPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAppData();
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const user = signIn(employeeId);
    if (!user) {
      setError('Employee ID not found. Contact an administrator if you need access.');
      return;
    }
    // Every successful sign-in lands on Home. Role-based route guards handle access.
    navigate(user.role === 'ADMIN' ? '/' : `/athletes/${encodeURIComponent(user.employeeId)}`, { replace: true });
  };

  return <Layout>
    <Box className="auth-page">
      <Paper className="auth-card" elevation={0}>
        <Typography className="overline">OFF•PACE · EMPLOYEE ACCESS</Typography>
        <Typography variant="h1">Sign in</Typography>
        <Typography color="text.secondary" fontSize={13}>Enter your employee ID to continue to the company events portal.</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
          <Typography className="form-label">Employee ID</Typography>
          <TextField fullWidth placeholder="e.g. EMP001" size="small" value={employeeId} onChange={event => setEmployeeId(event.target.value.toUpperCase())} required autoFocus autoComplete="username" inputProps={{ maxLength: 32 }} />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Continue</Button>
        </Box>
        <Box className="demo-login-note">
          <b>Demo sign-in</b>
          <span>Athlete: EMP001 · Admin: ADM001</span>
          <small>This source-only prototype checks the employee ID against its local roster. Employee ID alone is not secure authentication. Before production, connect this screen to company SSO or a server-side verified sign-in flow.</small>
        </Box>
        <Typography className="auth-foot">Need access? Contact your event administrator.</Typography>
      </Paper>
    </Box>
  </Layout>;
}

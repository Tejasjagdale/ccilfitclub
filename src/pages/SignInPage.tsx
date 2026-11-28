import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import Layout from '../components/Layout';
import { useAppData } from '../context/AppDataContext';
import { ADMIN_EMPLOYEE_ID } from '../data/appData';

export default function SignInPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { signIn, firebaseEnabled, connectionError } = useAppData();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (await signIn(employeeId)) navigate('/', { replace: true });
      else setError('Employee ID not found. Contact an administrator if you need access.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Sign-in is unavailable. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return <Layout>
    <Box className="auth-page">
      <Paper className="auth-card" elevation={0}>
        <Typography className="overline">OFF•PACE · EMPLOYEE ACCESS</Typography>
        <Typography variant="h1">Sign in</Typography>
        <Typography color="text.secondary" fontSize={13}>Enter your employee ID to continue to the company events portal.</Typography>
        {(error || connectionError) && <Alert severity="error" sx={{ mt: 2, overflowWrap: 'anywhere' }}>{error || connectionError}</Alert>}
        <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
          <Typography component="label" htmlFor="sign-in-employee-id" className="form-label" display="block">Employee ID</Typography>
          <TextField id="sign-in-employee-id" fullWidth placeholder="e.g. EMP001" size="small" value={employeeId} onChange={event => {
            setEmployeeId(event.target.value.toUpperCase());
            setError('');
          }} required autoFocus autoComplete="username" inputProps={{ maxLength: 32 }} disabled={busy} />
          <Button fullWidth variant="contained" type="submit" disabled={busy} sx={{ mt: 2 }}>{busy ? 'Signing in…' : 'Continue'}</Button>
        </Box>
        {!firebaseEnabled && <Box className="demo-login-note">
          <b>Demo sign-in</b>
          <span>Athlete: EMP001 · Admin: {ADMIN_EMPLOYEE_ID}</span>
          <small>This source-only prototype checks the employee ID against its local roster. Employee ID alone is not secure authentication. Before production, connect this screen to company SSO or a server-side verified sign-in flow.</small>
        </Box>}
        <Typography className="auth-foot">Need access? Contact your event administrator.</Typography>
      </Paper>
    </Box>
  </Layout>;
}

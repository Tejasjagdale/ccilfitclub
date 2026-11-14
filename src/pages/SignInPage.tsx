import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import Layout from '../components/Layout';

export default function SignInPage() {
  return (
    <Layout>
      <Box className="auth-page">
        <Paper className="auth-card" elevation={0}>
          <Typography className="overline">EMPLOYEE ACCESS</Typography>
          <Typography variant="h1">Sign in</Typography>
          <Typography color="text.secondary" fontSize={13}>Use your employee ID to continue.</Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 3 }}>
            <Typography className="form-label">Employee ID</Typography>
            <TextField fullWidth placeholder="e.g. EMP001" size="small" />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Continue</Button>
          </Box>
          <Typography className="auth-foot">New to the group? <RouterLink to="/register">Register here</RouterLink></Typography>
        </Paper>
      </Box>
    </Layout>
  );
}
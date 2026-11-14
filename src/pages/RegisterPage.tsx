import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import Layout from '../components/Layout';

export default function RegisterPage() {
  return (
    <Layout>
      <Box className="auth-page">
        <Paper className="auth-card" elevation={0}>
          <Typography className="overline">JOIN THE GROUP</Typography>
          <Typography variant="h1">Register</Typography>
          <Typography color="text.secondary" fontSize={13}>Enter your employee details to get added to the roster.</Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ mt: 3 }}>
            <Typography className="form-label">First name</Typography>
            <TextField fullWidth placeholder="First name" size="small" />
            <Typography className="form-label">Last name</Typography>
            <TextField fullWidth placeholder="Last name" size="small" sx={{ mt: 1 }} />
            <Typography className="form-label">Employee ID</Typography>
            <TextField fullWidth placeholder="e.g. EMP006" size="small" sx={{ mt: 1 }} />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Register</Button>
          </Box>
          <Typography className="auth-foot">Already registered? <RouterLink to="/signin">Sign in</RouterLink></Typography>
          <Typography className="auth-status-note">Employee status is maintained separately by the admin.</Typography>
        </Paper>
      </Box>
    </Layout>
  );
}
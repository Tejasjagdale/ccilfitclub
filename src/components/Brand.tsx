import { Box, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
      <Box className="brand-mark"><BoltRoundedIcon sx={{ fontSize: 23 }} /></Box>
      <Typography className={`brand-word ${light ? 'brand-light' : ''}`}>pulse<span>.</span></Typography>
    </Box>
  );
}
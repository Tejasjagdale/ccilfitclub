import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';

export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const dark = (mode === 'system' ? systemMode : mode) === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';

  return <Tooltip title={label}>
    <IconButton className="theme-toggle" color="inherit" aria-label={label} onClick={() => setMode(dark ? 'light' : 'dark')}>
      {dark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
    </IconButton>
  </Tooltip>;
}

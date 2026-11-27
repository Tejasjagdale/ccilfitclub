import FitnessCenterRounded from '@mui/icons-material/FitnessCenterRounded';
import DirectionsRunRounded from '@mui/icons-material/DirectionsRunRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import SportsEsportsOutlined from '@mui/icons-material/SportsEsportsOutlined';
import SportsTennisRounded from '@mui/icons-material/SportsTennisRounded';
import './SportIcon.css';

const sportStyles = {
  HYROX: { icon: FitnessCenterRounded, color: 'lime', format: 'Timed performance' },
  MARATHON: { icon: DirectionsRunRounded, color: 'peach', format: 'Timed performance' },
  CHESS: { icon: null, color: 'violet', format: 'Knockout' },
  CARROM: { icon: RadioButtonCheckedRounded, color: 'blue', format: 'Knockout' },
  TABLE_TENNIS: { icon: SportsTennisRounded, color: 'blue', format: 'Knockout' },
};

export function sportStyle(sport: string) {
  return sportStyles[sport as keyof typeof sportStyles] ?? { icon: SportsEsportsOutlined, color: 'blue', format: 'Competition' };
}

export function SportIcon({ sport }: { sport: string }) {
  const { icon: Icon, color } = sportStyle(sport);
  return <span className={`pace-sport-icon pace-tone-${color}`} aria-hidden="true">{Icon ? <Icon fontSize="inherit" /> : <span className="pace-chess-mark">♞</span>}</span>;
}

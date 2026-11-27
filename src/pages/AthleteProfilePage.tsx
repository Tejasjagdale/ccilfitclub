import { Link, useParams } from 'react-router-dom';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import TrophyCabinet from '../components/TrophyCabinet';
import { SportIcon } from '../components/SportIcon';
import { useAppData } from '../context/AppDataContext';
import { athleteName, eventLink } from '../data/athleteEvents';

export default function AthleteProfilePage() {
  const { employeeId } = useParams();
  const { currentUser, users, registrations, competitions, awards: awardDirectory } = useAppData();
  const person = employeeId ? users.find(user => (user.employeeId.toLowerCase() === employeeId.toLowerCase() || user.id === employeeId) &&
    user.role === 'ATHLETE' && user.status !== 'REMOVED') : currentUser;

  if (!person) return <><Link className="ath-back-link" to="/athletes"><ArrowBackRounded />Athletes</Link><h1 className="ath-page-title">Athlete not found</h1></>;

  const own = person.id === currentUser?.id;
  const awards = awardDirectory[person.id] ?? [];
  const joined = new Set(registrations.filter(row => row.userId === person.id && row.status === 'REGISTERED').map(row => row.competitionId));
  const joinedEvents = competitions.filter(event => joined.has(event.id));

  return <div className="ath-profile">
    <Link className="ath-back-link" to="/"><ArrowBackRounded />All events</Link>
    <div className="ath-profile-title"><h1 className="ath-page-title">{own ? 'Trophy cabinet' : athleteName(person) + '’s trophy cabinet'}</h1></div>
    <TrophyCabinet key={person.id} awards={awards} collectionName={own ? 'Your awards' : 'Awards'} />

    {joinedEvents.length > 0 && <section className="ath-panel ath-profile-registrations" aria-labelledby="ath-profile-events">
      <div className="ath-panel-heading"><span className="ath-section-icon ath-icon-registration"><CalendarMonthOutlined /></span>
        <h2 id="ath-profile-events">Registered events</h2><span className="ath-section-count">{joinedEvents.length}</span>
      </div>
      <ul>{joinedEvents.map(event => <li key={event.id}>
        <Link to={eventLink(event)}><SportIcon sport={event.eventId} /><strong>{event.name}</strong><ArrowForwardRounded /></Link>
      </li>)}</ul>
    </section>}
  </div>;
}

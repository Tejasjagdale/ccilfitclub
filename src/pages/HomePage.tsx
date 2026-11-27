import { type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import SensorsRounded from '@mui/icons-material/SensorsRounded';
import { useAppData } from '../context/AppDataContext';
import { SportIcon } from '../components/SportIcon';
import { athleteName, editionDate, eventLink, standingsStage } from '../data/athleteEvents';
import { formatEventDate, registrationOpen } from '../data/competitionLifecycle';
import type { Competition, CompetitionResult, Registration } from '../types/domain';

const shortDate = { day: 'numeric', month: 'short' } as const;
const sections = [
  { id: 'registration', title: 'Open for registration', icon: EventAvailableOutlined, empty: 'No events are accepting registrations right now.' },
  { id: 'live', title: 'Live now', icon: SensorsRounded, empty: 'No events are live right now.' },
  { id: 'previous', title: 'Previous events', icon: HistoryRounded, empty: 'Completed events will appear here.' },
] as const;
type EventGroup = typeof sections[number]['id'];

export default function HomePage() {
  const { competitions, categories, currentUser, records, register, registrations, results, today, users } = useAppData();
  const events = {
    registration: competitions.filter(event => registrationOpen(event, today)).sort((a, b) => a.registrationDeadline.localeCompare(b.registrationDeadline)),
    live: competitions.filter(event => event.status === 'LIVE').sort((a, b) => editionDate(b).localeCompare(editionDate(a))),
    previous: competitions.filter(event => event.status === 'COMPLETED').sort((a, b) => editionDate(b).localeCompare(editionDate(a))),
  };
  const rosterByEvent = new Map<string, Registration[]>();
  registrations.filter(registration => registration.status === 'REGISTERED').forEach(row => {
    const roster = rosterByEvent.get(row.competitionId) ?? [];
    roster.push(row);
    rosterByEvent.set(row.competitionId, roster);
  });
  const resultsByEvent = new Map<string, CompetitionResult[]>();
  results.filter(result => result.status === 'FINAL').forEach(row => {
    const entries = resultsByEvent.get(row.competitionId) ?? [];
    entries.push(row);
    resultsByEvent.set(row.competitionId, entries);
  });
  const people = new Map(users.map(user => [user.id, user]));
  const allTimeRecords = records.filter(record => record.recordType === 'ALL_TIME').sort((a, b) => b.achievedAt.localeCompare(a.achievedAt));

  function renderEvent(event: Competition, group: EventGroup) {
    const roster = rosterByEvent.get(event.id) ?? [];
    const joined = roster.some(row => row.userId === currentUser?.id);
    const full = event.capacity > 0 && roster.length >= event.capacity;
    const eligible = group === 'registration' && currentUser?.status === 'ACTIVE';
    const category = categories.find(item => item.id === event.eventId);
    const scores = resultsByEvent.get(event.id) ?? [];
    const finalStage = standingsStage(scores, category?.format === 'KNOCKOUT');
    const winners = group === 'previous' && finalStage
      ? scores.filter(score => score.stage === finalStage && score.rank === 1).map(score => athleteName(people.get(score.userId)))
      : [];
    const date = group === 'registration' ? `Closes ${formatEventDate(event.registrationDeadline, shortDate)}`
      : group === 'live' ? `${roster.length} registered` : formatEventDate(editionDate(event));
    const href = eventLink(event);

    return <article className="ath-event-row" key={event.id}>
      <div className="ath-event-row-top">
        <SportIcon sport={event.eventId} />
        <div className="ath-event-identity">
          <h3><Link to={href}>{event.name}</Link></h3>
          <span>{category?.name ?? event.eventId}{event.venue && group !== 'previous' ? ` · ${event.venue}` : ''}</span>
        </div>
      </div>
      <div className="ath-event-row-bottom">
        <div className="ath-event-meta">
          <span><CalendarMonthOutlined />{date}</span>
          {winners.length > 0 && <span><EmojiEventsOutlined />{winners.length === 1 ? 'Winner' : 'Winners'} · {winners.join(', ')}</span>}
        </div>
        {group === 'registration' ? joined ? <span className="ath-status ath-status-open" role="status"><CheckRounded />Registered</span>
          : eligible ? <button className="ath-action" type="button" onClick={() => register(event.id, currentUser.id)} disabled={full}
            aria-label={full ? `${event.name} is full` : `Register for ${event.name}`}>{full ? 'Event full' : 'Register'}{!full && <ArrowForwardRounded />}</button>
            : <Link className="ath-text-action" to={href}>View event <ArrowForwardRounded /></Link>
        : <Link className="ath-text-action" to={href} aria-label={`Standings and records for ${event.name}`}>Standings & records <ArrowForwardRounded /></Link>}
      </div>
    </article>;
  }

  function renderSection({ id, title, icon, empty }: typeof sections[number]) {
    return <EventSection id={id} title={title} icon={icon} empty={empty} count={events[id].length} key={id}>
      {events[id].map(event => renderEvent(event, id))}
    </EventSection>;
  }

  return <>
    <section className="ath-hero" aria-labelledby="ath-title">
      <div>
        <h1 id="ath-title">Your events</h1>
        <p>Find your next competition, follow live standings, and revisit past results.</p>
      </div>
    </section>
    <nav className="ath-jump-nav" aria-label="Jump to event section">
      <a href="#registration">Register</a><a href="#live">Live now</a><a href="#previous">Previous events</a>
    </nav>
    <div className="ath-dashboard-grid">
      <div className="ath-dashboard-active">{sections.slice(0, 2).map(renderSection)}</div>
      {renderSection(sections[2])}
    </div>
    <section className="ath-panel ath-record-summary" aria-labelledby="ath-home-records">
      <div className="ath-panel-heading">
        <span className="ath-section-icon ath-icon-record"><EmojiEventsOutlined /></span>
        <div><h2 id="ath-home-records">All-time records</h2><p>Verified performances across event editions.</p></div>
      </div>
      {allTimeRecords.length ? <div className="ath-record-summary-grid">
        {allTimeRecords.map(record => <Link className="ath-record-summary-row" to={`${eventLink({ id: record.competitionId, eventId: record.eventId })}#records`} key={record.id}>
          <SportIcon sport={record.eventId} />
          <div><strong>{record.metric}</strong><span>{athleteName(people.get(record.userId))}</span></div>
          <b>{record.value}</b><ArrowForwardRounded />
        </Link>)}
      </div> : <p className="ath-empty">Verified records will appear here.</p>}
    </section>
  </>;
}

function EventSection({ id, title, icon: Icon, empty, count, children }: {
  id: EventGroup; title: string; icon: ComponentType; empty: string; count: number; children: ReactNode;
}) {
  return <section id={id} className="ath-panel ath-event-section" aria-labelledby={`ath-events-${id}`}>
    <div className="ath-panel-heading">
      <span className={`ath-section-icon ath-icon-${id}`}><Icon /></span>
      <h2 id={`ath-events-${id}`}>{title}</h2>
      <span className="ath-section-count">{count}</span>
    </div>
    {count ? children : <p className="ath-empty">{empty}</p>}
  </section>;
}

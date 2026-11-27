import { Link, useParams, useSearchParams } from 'react-router-dom';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import SportsScoreRounded from '@mui/icons-material/SportsScoreRounded';
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined';
import { SportIcon, sportStyle } from '../components/SportIcon';
import { useAppData } from '../context/AppDataContext';
import { athleteName, editionDate, standingsStage } from '../data/athleteEvents';
import { eventStatus, formatEventDate, registrationOpen, statusLabel } from '../data/competitionLifecycle';
import { roundLabel } from '../data/scoring';
import type { EventRecord } from '../types/domain';

export default function EventDetailPage() {
  const { eventId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { categories, competitions, registrations, results, matches, records, users, currentUser, register, today } = useAppData();
  const category = categories.find(item => item.id === eventId);
  const editions = competitions.filter(item => item.eventId === eventId && item.status !== 'DRAFT')
    .sort((a, b) => editionDate(b).localeCompare(editionDate(a)));
  const edition = editions.find(item => item.id === params.get('competition')) ?? editions[0];
  const quarters = [...new Set(editions.map(item => `${item.quarter} ${item.year}`))];
  const people = new Map(users.map(user => [user.id, user]));
  const personName = (id: string) => athleteName(people.get(id));

  if (!category) return <><Link className="ath-back-link" to="/"><ArrowBackRounded />All events</Link><h1 className="ath-page-title">Event not found</h1></>;

  const scores = results.filter(row => row.competitionId === edition?.id);
  const editionMatches = matches.filter(match => match.competitionId === edition?.id);
  const stage = standingsStage(scores, editionMatches.length > 0);
  const standings = scores.filter(row => row.stage === stage).sort((a, b) => a.rank - b.rank);
  const entrants = registrations.filter(row => row.competitionId === edition?.id && row.status === 'REGISTERED');
  const participants = [...new Set([...entrants.map(row => row.userId), ...scores.map(row => row.userId)])];
  const joined = entrants.some(row => row.userId === currentUser?.id);
  const open = edition && registrationOpen(edition, today);
  const full = !!edition && edition.capacity > 0 && entrants.length >= edition.capacity;
  const status = edition ? eventStatus(edition, today) : null;
  const statusTone = status === 'REGISTRATION_OPEN' && open ? 'open' : status?.toLowerCase() ?? 'neutral';
  const statusText = status === 'READY' ? 'Registration closed' : status === 'REGISTRATION_OPEN' && !open
    ? 'Registration opens later' : status ? statusLabel[status] : '';
  const recordList = records.filter(record => record.eventId === eventId).sort((a, b) => b.achievedAt.localeCompare(a.achievedAt));
  const allTime = recordList.filter(record => record.recordType === 'ALL_TIME');
  const achievements = recordList.filter(record => record.recordType === 'UNIQUE');
  const standingsTitle = edition?.status === 'LIVE' ? 'Live standings' : edition?.status === 'COMPLETED' ? 'Final standings' : 'Standings';
  const currentScoreLabel = standings[0]?.scoreLabel ?? category.scoreLabel;

  function recordRow(record: EventRecord) {
    return <li className="ath-record" key={record.id}>
      <div><strong>{record.metric}</strong><span>{personName(record.userId)} · {formatEventDate(record.achievedAt)}</span>
        {record.note && <p>{record.note}</p>}
      </div>
      <b>{record.value}</b>
    </li>;
  }

  return <>
    <Link className="ath-back-link" to="/"><ArrowBackRounded />All events</Link>
    <section className="ath-panel ath-event-detail" aria-labelledby="ath-detail-title">
      <div className="ath-detail-top">
        <SportIcon sport={eventId} />
        <div className="ath-detail-identity">
          <div className="ath-detail-caption">{category.name} · {sportStyle(eventId).format}</div>
          <h1 id="ath-detail-title">{edition?.name ?? category.name}</h1>
        </div>
        {status && <span className={`ath-status ath-status-${statusTone}`}><i />{statusText}</span>}
      </div>
      <p className="ath-detail-description">{edition?.description || category.description}</p>
      {edition && <div className="ath-detail-meta">
        {edition.startAt && <span><CalendarMonthOutlined />{formatEventDate(edition.startAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>}
        {edition.venue && <span><PlaceOutlined />{edition.venue}</span>}
        <span><GroupsOutlined />{entrants.length}{edition.capacity > 0 ? ` / ${edition.capacity}` : ''} registered</span>
      </div>}
      {open && <div className="ath-registration-banner">
        <div><strong>Registration is open</strong><span>Closes at the end of {formatEventDate(edition.registrationDeadline)} (IST)</span></div>
        {joined ? <span className="ath-status ath-status-open" role="status"><CheckRounded />You're registered</span>
          : currentUser?.status === 'ACTIVE' && <button className="ath-action" type="button" disabled={full} onClick={() => register(edition.id, currentUser.id)}>{full ? 'Event full' : 'Register for event'}</button>}
      </div>}
    </section>

    <div className="ath-detail-grid">
      <section className="ath-panel ath-standings" aria-labelledby="ath-standings-title">
        <div className="ath-panel-heading">
          <span className="ath-section-icon ath-icon-live"><SportsScoreRounded /></span>
          <div><h2 id="ath-standings-title">{standingsTitle}</h2>{stage && <p>{roundLabel(stage)}</p>}</div>
          {edition && editions.length > 1 && <label className="ath-edition-select">
            <span>Event edition</span>
            <select value={edition.id} onChange={e => setParams({ competition: e.target.value }, { preventScrollReset: true })}>
              {quarters.map(quarter => <optgroup label={quarter} key={quarter}>
                {editions.filter(item => `${item.quarter} ${item.year}` === quarter).map(item =>
                  <option key={item.id} value={item.id}>{item.name} · {formatEventDate(editionDate(item), { day: 'numeric', month: 'short' })}</option>)}
              </optgroup>)}
            </select>
          </label>}
        </div>
        {standings.length > 0 && <table className="ath-standings-table">
          <thead><tr><th scope="col">Rank</th><th scope="col">Athlete</th><th scope="col">{currentScoreLabel}</th></tr></thead>
          <tbody>{standings.map(result => <tr key={result.id} className={result.userId === currentUser?.id ? 'ath-own-result' : ''}>
            <td><span className={`ath-rank${result.rank === 1 ? ' ath-rank-first' : ''}`}>{result.rank}</span></td>
            <td><strong>{personName(result.userId)}</strong>{result.userId === currentUser?.id && <span className="ath-you">You</span>}{result.detail && <small>{result.detail}</small>}</td>
            <td><b>{result.score}</b></td>
          </tr>)}</tbody>
        </table>}
        {editionMatches.length > 0 && <div className="ath-matches">
          <h3>Match results</h3>
          <ul>{editionMatches.map(match => <li key={match.id}>
            <div><strong>{personName(match.winnerId)} defeated {personName(match.opponentId)}</strong>
              <span>{roundLabel(match.stage)} · Margin {match.winnerScore - match.opponentScore}</span></div>
            <b>{match.winnerScore}–{match.opponentScore}</b>
          </li>)}</ul>
        </div>}
        {standings.length === 0 && editionMatches.length === 0 && <div className="ath-empty ath-empty-standings">
          <SportsScoreRounded /><strong>{edition ? 'No scores published yet' : 'No event editions yet'}</strong>
          <p>{edition ? 'Results will appear here once they are recorded.' : 'Standings will appear when a competition has results.'}</p>
        </div>}
      </section>
      <section id="records" className="ath-panel ath-records" aria-labelledby="ath-records-title">
        <div className="ath-panel-heading">
          <span className="ath-section-icon ath-icon-record"><EmojiEventsOutlined /></span>
          <div><h2 id="ath-records-title">All-time records</h2><p>Across all {category.name} editions</p></div>
        </div>
        {allTime.length ? <ul>{allTime.map(recordRow)}</ul> : <p className="ath-empty">No all-time records have been verified yet.</p>}
        {achievements.length > 0 && <div className="ath-achievements">
          <h3><WorkspacePremiumOutlined />Unique achievements</h3>
          <ul>{achievements.map(recordRow)}</ul>
        </div>}
      </section>
    </div>

    {edition && participants.length > 0 && <section className="ath-panel ath-participants" aria-labelledby="ath-participants-title">
      <div className="ath-panel-heading"><span className="ath-section-icon ath-icon-registration"><GroupsOutlined /></span>
        <h2 id="ath-participants-title">Participants</h2><span className="ath-section-count">{participants.length}</span>
      </div>
      <ul>{participants.map(id => <li key={id}>{personName(id)}{id === currentUser?.id && <span> (you)</span>}</li>)}</ul>
    </section>}
  </>;
}

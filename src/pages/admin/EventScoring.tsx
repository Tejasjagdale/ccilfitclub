import { useState, type FormEvent } from 'react';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SportsScoreRounded from '@mui/icons-material/SportsScoreRounded';
import { useAppData } from '../../context/AppDataContext';
import { knockoutRounds, normalizeFinishTime, roundLabel, validateMatch } from '../../data/scoring';
import type { AppUser, Competition, EventCategory, KnockoutMatch } from '../../types/domain';

interface Props { event: Competition; category?: EventCategory; entrants: AppUser[]; notify: (message: string) => void }
const fullName = (user?: AppUser) => user ? `${user.firstName} ${user.lastName}` : 'Unknown athlete';

export default function EventScoring({ event, category, entrants, notify }: Props) {
  const { users, results, matches, saveMatch, saveResult } = useAppData();
  const [athlete, setAthlete] = useState('');
  const [performance, setPerformance] = useState('');
  const [rank, setRank] = useState('1');
  const [notes, setNotes] = useState('');
  const [winner, setWinner] = useState('');
  const [opponent, setOpponent] = useState('');
  const [winnerScore, setWinnerScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [round, setRound] = useState('FINAL');
  const [error, setError] = useState('');
  const [editingMatch, setEditingMatch] = useState<KnockoutMatch | null>(null);
  const live = event.status === 'LIVE';
  const complete = event.status === 'COMPLETED';
  const knockout = category?.format === 'KNOCKOUT';
  const timed = category?.unit === 'time';
  const eventResults = results.filter(r => r.competitionId === event.id).sort((a, b) => a.rank - b.rank);
  const eventMatches = matches.filter(m => m.competitionId === event.id);
  const matchPlayers = editingMatch ? entrants.filter(user => user.id === editingMatch.winnerId || user.id === editingMatch.opponentId) : entrants;
  const canScore = live && category && entrants.length >= (knockout ? 2 : 1);
  const name = (id: string) => fullName(users.find(u => u.id === id));
  const closedMessage = event.status === 'CANCELLED' ? 'This event was cancelled.' :
    complete ? 'Results for this event are final.' : 'Scoring opens when you start the event.';

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!canScore) return;
    if (knockout) {
      const match = { competitionId: event.id, stage: round, winnerId: winner, opponentId: opponent,
        winnerScore: winnerScore.trim() ? Number(winnerScore) : Number.NaN,
        opponentScore: opponentScore.trim() ? Number(opponentScore) : Number.NaN };
      const message = validateMatch(match, eventMatches, event.eventId);
      if (message) { setError(message); return; }
      saveMatch(match);
      resetMatch();
      notify('Match result saved.');
    } else {
      if (timed && !normalizeFinishTime(performance)) { setError('Enter a finish time in HH:MM:SS format.'); return; }
      if (!athlete || !performance.trim() || (!timed && (!Number.isFinite(Number(performance)) || Number(performance) < 0 || !Number.isInteger(Number(rank)) || Number(rank) < 1))) {
        setError('Select an athlete and enter a valid result.');
        return;
      }
      saveResult({ competitionId: event.id, userId: athlete, score: performance, detail: notes, rank: timed ? undefined : Number(rank) });
      setAthlete(''); setPerformance(''); setNotes('');
      notify('Performance saved.');
    }
    setError('');
  }

  function editMatch(match: KnockoutMatch) {
    setEditingMatch(match);
    setRound(match.stage); setWinner(match.winnerId); setOpponent(match.opponentId);
    setWinnerScore(String(match.winnerScore)); setOpponentScore(String(match.opponentScore)); setError('');
    document.getElementById('ops-score-form')?.scrollIntoView({ block: 'center' });
  }

  function resetMatch() {
    setEditingMatch(null);
    setWinner(''); setOpponent(''); setWinnerScore(''); setOpponentScore(''); setError('');
  }

  return <section className="ops-panel ops-inset" aria-labelledby="ops-score-title">
    <div className="ops-panel-heading"><div><h2 id="ops-score-title">{complete ? 'Final results' : knockout ? 'Match scoring' : 'Performance scoring'}</h2>
      <p>{knockout ? 'Record who won and the score for each player.' : timed ? 'Record finish times. Rankings update automatically.' : 'Record results for registered participants.'}</p></div>
      {live && <span className="ops-badge ops-badge-live"><i />Live now</span>}
    </div>
    {canScore ? <form id="ops-score-form" className="ops-score-form" onSubmit={submit}>
      {error && <Alert className="ops-span-two" severity="error">{error}</Alert>}
      {knockout ? <>
        <TextField className="ops-span-two" select label="Round" value={round} onChange={e => setRound(e.target.value)} required disabled={Boolean(editingMatch)}>
          {knockoutRounds.map(stage => <MenuItem value={stage} key={stage}>{roundLabel(stage)}</MenuItem>)}
        </TextField>
        <TextField select label="Match winner" value={winner} onChange={e => { setWinner(e.target.value); if (e.target.value === opponent) setOpponent(''); }} required>
          {matchPlayers.map(u => <MenuItem value={u.id} key={u.id}>{fullName(u)}</MenuItem>)}
        </TextField>
        <TextField select label="Opponent" value={opponent} onChange={e => setOpponent(e.target.value)} required>
          {matchPlayers.filter(u => u.id !== winner).map(u => <MenuItem value={u.id} key={u.id}>{fullName(u)}</MenuItem>)}
        </TextField>
        <TextField label="Winner’s score" type="number" value={winnerScore} onChange={e => setWinnerScore(e.target.value)} required inputProps={{ min: 0, step: event.eventId === 'CHESS' ? 0.5 : 1 }} />
        <TextField label="Opponent’s score" type="number" value={opponentScore} onChange={e => setOpponentScore(e.target.value)} required inputProps={{ min: 0, step: event.eventId === 'CHESS' ? 0.5 : 1 }} />
      </> : <>
        <TextField select label="Athlete" value={athlete} onChange={e => {
          const existing = eventResults.find(r => r.userId === e.target.value);
          setAthlete(e.target.value); setPerformance(existing?.score ?? ''); setNotes(existing?.detail ?? '');
          setRank(String(existing?.rank ?? 1));
        }} required>{entrants.map(u => <MenuItem value={u.id} key={u.id}>{fullName(u)}</MenuItem>)}</TextField>
        <TextField label={category.scoreLabel} type={timed ? 'text' : 'number'} value={performance} onChange={e => setPerformance(e.target.value)}
          placeholder={timed ? '01:24:30' : '0'} helperText={timed ? 'HH:MM:SS' : undefined}
          inputProps={timed ? undefined : { min: 0, step: 'any' }} required />
        {!timed && <TextField label="Position" type="number" value={rank} onChange={e => setRank(e.target.value)} required inputProps={{ min: 1 }} />}
        <TextField className="ops-span-two" label="Result notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
      </>}
      <div className="ops-span-two ops-form-actions"><Button type="submit" className="ops-primary" startIcon={<SaveOutlined />}>{editingMatch ? 'Save correction' : knockout ? 'Save match' : 'Save performance'}</Button>
        {editingMatch && <Button className="ops-secondary" onClick={resetMatch}>Cancel correction</Button>}
      </div>
    </form> : (!eventResults.length || !complete) && <div className="ops-empty ops-score-empty">
      {live || complete ? <SportsScoreRounded /> : <LockOutlined />}
      <strong>{live ? 'Waiting for participants' : complete ? 'No results recorded' : 'Scoring is closed'}</strong>
      <p>{live ? (knockout ? 'At least two registered players are needed to record a match.' : 'At least one registered athlete is needed to record a performance.') : closedMessage}</p>
    </div>}
    {eventMatches.length ? <div className="ops-result-stack">
      <h3>Recorded matches</h3>
      {eventMatches.map(match => <div key={match.id} className="ops-history-row">
        <div><strong>{name(match.winnerId)} defeated {name(match.opponentId)}</strong><small>{roundLabel(match.stage)} · Margin {match.winnerScore - match.opponentScore}</small></div>
        <b>{match.winnerScore}–{match.opponentScore}</b>
        {live && <button type="button" className="ops-icon-button" onClick={() => editMatch(match)} aria-label={`Edit match between ${name(match.winnerId)} and ${name(match.opponentId)}`}><EditOutlined /></button>}
      </div>)}
    </div> : eventResults.length > 0 && <div className="ops-result-stack">
      <h3>{timed ? 'Standings' : 'Recorded results'}</h3>
      {eventResults.map(result => <div key={result.id} className="ops-history-row">
        <span className="ops-placement">{String(result.rank).padStart(2, '0')}</span>
        <div><strong>{name(result.userId)}</strong>{result.detail && <small>{result.detail}</small>}</div><b>{result.score}</b>
      </div>)}
    </div>}
  </section>;
}

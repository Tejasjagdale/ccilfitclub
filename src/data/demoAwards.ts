import type { CabinetAward } from '../types/domain';

export const awardsByAthlete: Record<string, CabinetAward[]> = {
  'u-1': [
    { id: 'a1', event: 'HYROX: The Gauntlet', title: 'Engine of the Day', date: '22 Nov 2026', type: 'hyrox', placement: 'Top 10', detail: 'Recognised for an outstanding all-round performance across the run and functional workout stations.', finish: '01:08:42' },
    { id: 'a2', event: 'City Miles 5K', title: 'Personal Best', date: '06 Dec 2026', type: 'run', placement: '00:24:18', detail: 'A new personal best at the City Miles 5K.' },
  ],
  'u-2': [
    { id: 'b1', event: 'The Office Chess Open', title: 'Queen’s Gambit', date: '29 Nov 2026', type: 'chess', placement: '2nd place', detail: 'A podium finish after a sharp final match in the Office Chess Open.' },
    { id: 'b2', event: 'City Miles 5K', title: 'Race Finisher', date: '06 Dec 2026', type: 'run', placement: 'Finisher', detail: 'Completed the City Miles 5K with the office crew.' },
  ],
  'u-3': [
    { id: 'c1', event: 'HYROX: The Gauntlet', title: 'Team Power', date: '22 Nov 2026', type: 'hyrox', placement: 'Team award', detail: 'Recognised for teamwork, consistency and determination throughout the challenge.' },
  ],
  'u-4': [
    { id: 'd1', event: 'The Office Chess Open', title: 'Chess Contender', date: '29 Nov 2026', type: 'chess', placement: 'Finalist', detail: 'Reached the final stage of the Office Chess Open.' },
  ],
  'u-5': [
    { id: 'e1', event: 'City Miles 5K', title: 'First 5K', date: '06 Dec 2026', type: 'run', placement: 'Finisher', detail: 'Completed a first 5K event and earned a place in the cabinet.' },
  ],
};

export type EventCategory = 'Fitness' | 'Strategy' | 'Outdoor';

export interface EventItem {
  id: number;
  title: string;
  category: EventCategory;
  date: string;
  day: string;
  month: string;
  time: string;
  venue: string;
  participants: number;
  capacity: number;
  status: 'Registration open' | 'Coming soon' | 'Almost full';
  image: string;
  description: string;
  tag: string;
}

export const events: EventItem[] = [
  {
    id: 1, title: 'HYROX: THE GAUNTLET', category: 'Fitness', date: '22 Nov 2026', day: '22', month: 'NOV',
    time: '7:00 AM – 12:00 PM', venue: 'Arena Sports Club, Mumbai', participants: 84, capacity: 120,
    status: 'Registration open', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=90',
    description: 'Eight stations. One finish line. Find out what you are made of.',
    tag: 'HIGH INTENSITY'
  },
  {
    id: 2, title: 'CHECKMATE CLUB', category: 'Strategy', date: '29 Nov 2026', day: '29', month: 'NOV',
    time: '10:00 AM – 4:00 PM', venue: 'The Commons, 5th Floor', participants: 32, capacity: 48,
    status: 'Registration open', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=90',
    description: 'Quiet room. Loud minds. Make your move and own the board.',
    tag: 'MIND GAMES'
  },
  {
    id: 3, title: 'MILES OF MAYHEM', category: 'Outdoor', date: '06 Dec 2026', day: '06', month: 'DEC',
    time: '5:30 AM – 9:30 AM', venue: 'Bandra Promenade, Mumbai', participants: 156, capacity: 200,
    status: 'Almost full', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=90',
    description: 'A city waking up, a crew moving together, and miles to make count.',
    tag: 'OUTDOOR RUN'
  }
];

export const categories = [
  { name: 'All events', count: 3, icon: '✳' },
  { name: 'Fitness', count: 1, icon: '↗' },
  { name: 'Strategy', count: 1, icon: '♟' },
  { name: 'Outdoor', count: 1, icon: '⌁' }
];
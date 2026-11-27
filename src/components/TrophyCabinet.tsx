import { useId, useState } from 'react';
import { Button, Dialog, IconButton, useMediaQuery } from '@mui/material';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import type { CabinetAward } from '../types/domain';
import './TrophyCabinet.css';

type Props = { awards: CabinetAward[]; collectionName: string };

function TrophyArt({ type, prefix }: { type: CabinetAward['type']; prefix: string }) {
  const gold = `url(#${prefix}gold)`;
  const goldInner = `url(#${prefix}goldInner)`;
  const silverGold = `url(#${prefix}silverGold)`;
  const woodGold = `url(#${prefix}woodGold)`;
  if (type === 'chess') {
    return (
      <g>
        <ellipse cx="100" cy="111" rx="43" ry="5" fill="#120e0b" opacity=".55" />
        <path d="M62 104 Q100 98 138 104 L134 113 Q100 119 66 113Z" fill={woodGold} stroke="#5c3519" strokeWidth="2" />
        <path d="M73 102 Q100 96 127 102 L124 107 Q100 111 76 107Z" fill={silverGold} />
        <path d="M78 99 C81 91 76 84 83 77 C88 71 91 66 88 58 C86 52 79 48 82 40 C85 32 95 31 99 24 C103 17 100 10 108 8 C116 7 119 16 117 22 C114 30 122 33 127 40 C133 49 127 58 121 64 C116 69 121 77 125 83 L130 99Z" fill={silverGold} stroke="#5d472f" strokeWidth="3" strokeLinejoin="round" />
        <path d="M83 57 Q96 64 111 59 Q120 55 126 48" fill="none" stroke="#fff1c8" strokeWidth="3" opacity=".55" />
        <path d="M103 34 Q111 29 119 35 Q124 41 120 47 Q114 51 108 45Z" fill="#25313a" />
        <circle cx="113" cy="39" r="2.6" fill="#1c2022" />
        <path d="M102 9 Q111 -1 121 9 L127 19 Q117 17 109 22 L99 19Z" fill={gold} stroke="#654019" strokeWidth="2" />
        <path d="M84 77 Q101 85 125 80" fill="none" stroke="#fff0bd" strokeWidth="2" opacity=".45" />
      </g>
    );
  }

  if (type === 'run') {
    return (
      <g>
        <ellipse cx="100" cy="112" rx="44" ry="5" fill="#120e0b" opacity=".55" />
        <path d="M67 14 L89 22 L101 58 L88 61Z" fill="#1c527d" stroke="#0c2d4a" strokeWidth="2" />
        <path d="M111 22 L133 13 L112 61 L99 58Z" fill="#9d2d38" stroke="#57202a" strokeWidth="2" />
        <path d="M85 17 L101 23 L105 55 L95 57Z" fill="#f0d5a0" opacity=".9" />
        <path d="M100 52 C75 52 66 68 68 85 C70 101 84 108 100 108 C116 108 130 101 132 85 C134 68 125 52 100 52Z" fill={gold} stroke="#67441d" strokeWidth="3" />
        <circle cx="100" cy="80" r="24" fill={goldInner} stroke="#f3d68a" strokeWidth="3" />
        <circle cx="100" cy="80" r="18" fill="none" stroke="#8c5c24" strokeWidth="1.7" />
        <path d="M100 66 L104 77 L115 80 L104 84 L100 95 L96 84 L85 80 L96 77Z" fill="#93621f" opacity=".88" />
        <path d="M85 67 Q100 57 115 67" fill="none" stroke="#fff0b6" strokeWidth="3" opacity=".8" />
      </g>
    );
  }

  return (
    <g>
      <ellipse cx="100" cy="112" rx="47" ry="5" fill="#120e0b" opacity=".55" />
      <path d="M61 42 C42 23 35 44 48 60 C55 69 66 68 75 62" fill="none" stroke={gold} strokeWidth="9" strokeLinecap="round" />
      <path d="M139 42 C158 23 165 44 152 60 C145 69 134 68 125 62" fill="none" stroke={gold} strokeWidth="9" strokeLinecap="round" />
      <path d="M66 37 Q100 45 134 37 L127 66 Q121 82 100 85 Q79 82 73 66Z" fill={gold} stroke="#70451c" strokeWidth="3" />
      <path d="M73 39 Q100 47 127 39 L122 59 Q100 70 78 59Z" fill={goldInner} opacity=".8" />
      <path d="M78 82 L122 82 L116 96 L84 96Z" fill={gold} stroke="#70451c" strokeWidth="2" />
      <path d="M91 94 L109 94 L113 105 L87 105Z" fill={goldInner} stroke="#70451c" strokeWidth="2" />
      <path d="M74 108 Q100 103 126 108 L130 114 Q100 120 70 114Z" fill={woodGold} stroke="#5f391b" strokeWidth="2" />
      <path d="M78 44 Q100 50 122 44" fill="none" stroke="#fff2c2" strokeWidth="3" opacity=".75" />
      <circle cx="100" cy="26" r="4" fill="#fff0b0" opacity=".9" />
    </g>
  );
}

function TrophyArtwork({ type }: { type: CabinetAward['type'] }) {
  const prefix = `trophy-${useId().replace(/:/g, '')}-`;
  return (
    <svg className="trophy-artwork" viewBox="36 -4 128 140" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${prefix}gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0ad" /><stop offset=".22" stopColor="#e8c16e" /><stop offset=".5" stopColor="#a66e2b" /><stop offset=".76" stopColor="#f0ca79" /><stop offset="1" stopColor="#76501f" />
        </linearGradient>
        <linearGradient id={`${prefix}goldInner`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c0" /><stop offset=".5" stopColor="#d5a34c" /><stop offset="1" stopColor="#80502c" />
        </linearGradient>
        <linearGradient id={`${prefix}silverGold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8de" /><stop offset=".3" stopColor="#c8c6b8" /><stop offset=".65" stopColor="#7d8586" /><stop offset="1" stopColor="#e7d4a3" />
        </linearGradient>
        <linearGradient id={`${prefix}woodGold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4a66a" /><stop offset=".45" stopColor="#80502c" /><stop offset="1" stopColor="#43271b" />
        </linearGradient>
      </defs>
      <TrophyArt type={type} prefix={prefix} />
    </svg>
  );
}

function TrophyDetails({ award, open, onClose }: { award: CabinetAward; open: boolean; onClose: () => void }) {
  const titleId = useId();
  const detailId = useId();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      transitionDuration={reducedMotion ? 0 : undefined}
      PaperProps={{ className: 'trophy-detail' }} aria-labelledby={titleId} aria-describedby={detailId}>
      <IconButton className="trophy-detail__close" onClick={onClose} aria-label="Close award details" autoFocus>
        <CloseRounded />
      </IconButton>
      <div className="trophy-detail__layout">
        <div className={`trophy-stage trophy-stage--${award.type} trophy-detail__stage`}>
          <TrophyArtwork type={award.type} />
        </div>
        <div className="trophy-detail__body">
          <p className="trophy-detail__event">{award.event}</p>
          <h2 id={titleId}>{award.title}</h2>
          <p className="trophy-detail__description" id={detailId}>{award.detail}</p>
          <dl className="trophy-detail__facts">
            <div><dt>Placement</dt><dd>{award.placement}</dd></div>
            <div><dt>Award date</dt><dd>{award.date}</dd></div>
            {award.finish && <div><dt>Finish time</dt><dd>{award.finish}</dd></div>}
          </dl>
          <Button className="trophy-detail__back" onClick={onClose}>Return to cabinet</Button>
        </div>
      </div>
    </Dialog>
  );
}

export default function TrophyCabinet({ awards, collectionName }: Props) {
  const headingId = useId();
  const [selectedId, setSelectedId] = useState<string>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selected = awards.find(award => award.id === selectedId);

  return <>
    <section className="trophy-display" aria-labelledby={headingId}>
      <header className="trophy-display__header">
        <h2 id={headingId}>{collectionName}</h2>
        <span className="trophy-display__count">{awards.length} {awards.length === 1 ? 'award' : 'awards'}</span>
      </header>
      <div className="trophy-display__case">
        {awards.length > 0 ? <ul className="trophy-display__grid">
          {awards.map(award => <li key={award.id}>
            <button type="button" className="trophy-tile" aria-haspopup="dialog" onClick={() => {
              setSelectedId(award.id);
              setDetailsOpen(true);
            }}>
              <span className={`trophy-stage trophy-stage--${award.type} trophy-stage--bay`}>
                <span className="trophy-bay__light" aria-hidden="true" />
                <span className="trophy-bay__pedestal" aria-hidden="true" />
                <TrophyArtwork type={award.type} />
                <span className="trophy-bay__glass" aria-hidden="true" />
              </span>
              <span className="trophy-tile__label">
                <span className="trophy-tile__plate">
                  <span className="trophy-tile__copy">
                    <span className="trophy-tile__event">{award.event}</span>
                    <strong>{award.title}</strong>
                    <span className="trophy-tile__placement">{award.placement}</span>
                  </span>
                  <span className="trophy-tile__arrow"><ArrowForwardRounded /></span>
                </span>
              </span>
            </button>
          </li>)}
        </ul> : <div className="trophy-display__empty"><EmojiEventsOutlined /><p>No trophies yet</p></div>}
      </div>
      <div className="trophy-display__base" aria-hidden="true" />
    </section>
    {selected && <TrophyDetails award={selected} open={detailsOpen} onClose={() => setDetailsOpen(false)} />}
  </>;
}

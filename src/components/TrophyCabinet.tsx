import { useEffect, useRef, useState } from 'react';
import './TrophyCabinet.css';

export type CabinetAward = {
  id: string;
  event: string;
  title: string;
  date: string;
  type: 'hyrox' | 'chess' | 'run';
  placement: string;
  detail: string;
  finish?: string;
};


type TrophyCabinetProps = {
  awards: CabinetAward[];
  collectionName: string;
  selectedAwardId?: string | null;
  onAwardSelect: (award: CabinetAward) => void;
};

const BAY_ROWS = [
  { top: 102, shelf: 240 },
  { top: 260, shelf: 400 },
  { top: 420, shelf: 560 },
] as const;
const BAY_COLUMNS = [260, 600, 940] as const;
const MAX_AWARDS = BAY_ROWS.length * BAY_COLUMNS.length;

const WOODEN_PALETTE = {
  wood: ['#b17a4c', '#6c3e28', '#98603a', '#4c2b1e', '#a16b43'],
  front: ['#b67d50', '#875333', '#5b3424', '#321d17'],
  edge: ['#2f1b15', '#a26c42', '#d09a61', '#70432b', '#261611'],
  velvet: ['#263b4b', '#172b3a', '#0c1822'],
  shelf: ['#d19a61', '#9b623d', '#71432d', '#3b241c', '#241713'],
  case: '#241712', caseStroke: '#140d0a', inner: '#130e0e', trim: '#c08a55', spot: '#e7c98e', line: '#f2d89b', lineDark: '#97703f',
};

function TrophyArt({ type, prefix = '', standalone = false }: { type: CabinetAward['type']; prefix?: string; standalone?: boolean }) {
  const gold = `url(#${prefix}gold)`;
  const goldInner = `url(#${prefix}goldInner)`;
  const silverGold = `url(#${prefix}silverGold)`;
  const woodGold = `url(#${prefix}woodGold)`;
  const artClass = (name: string) => `${standalone ? 'trophy-art' : 'cabinet-art'} ${name}`;
  if (type === 'chess') {
    return (
      <g className={artClass('cabinet-art--chess')}>
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
      <g className={artClass('cabinet-art--run')}>
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
    <g className={artClass('cabinet-art--hyrox')}>
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


/** Same award artwork used in the shelf, enlarged in the award details dialog. */
export function TrophyArtwork({ type }: { type: CabinetAward['type'] }) {
  return (
    <svg className="award-trophy-artwork" viewBox="36 -4 128 140" role="img" aria-label={`${type} award trophy`}>
      <defs>
        <linearGradient id="modal-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0ad" /><stop offset=".22" stopColor="#e8c16e" /><stop offset=".5" stopColor="#a66e2b" /><stop offset=".76" stopColor="#f0ca79" /><stop offset="1" stopColor="#76501f" />
        </linearGradient>
        <linearGradient id="modal-goldInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c0" /><stop offset=".5" stopColor="#d5a34c" /><stop offset="1" stopColor="#8c5a23" />
        </linearGradient>
        <linearGradient id="modal-silverGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8de" /><stop offset=".3" stopColor="#c8c6b8" /><stop offset=".65" stopColor="#7d8586" /><stop offset="1" stopColor="#e7d4a3" />
        </linearGradient>
        <linearGradient id="modal-woodGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4a66a" /><stop offset=".45" stopColor="#80502c" /><stop offset="1" stopColor="#43271b" />
        </linearGradient>
      </defs>
      <TrophyArt type={type} prefix="modal-" standalone />
    </svg>
  );
}

function CornerDetails({ x, y, flipX, flipY }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1})`} className="cabinet-corner-detail">
      <path d="M0 25 Q0 6 19 6 Q29 6 32 -5 M1 9 Q10 9 10 -1 M12 22 Q19 14 25 15" fill="none" stroke="url(#goldLine)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="3" cy="5" r="2.4" fill="#d8b46b" />
      <circle cx="27" cy="15" r="2" fill="#d8b46b" />
    </g>
  );
}

export default function TrophyCabinet({ awards, collectionName, selectedAwardId, onAwardSelect }: TrophyCabinetProps) {
  const [launchingAwardId, setLaunchingAwardId] = useState<string | null>(null);
  const launchTimer = useRef<number | null>(null);
  const visibleAwards = awards.slice(0, MAX_AWARDS);
  const palette = WOODEN_PALETTE;

  useEffect(() => () => {
    if (launchTimer.current !== null) window.clearTimeout(launchTimer.current);
  }, []);

  const selectAward = (award: CabinetAward) => {
    if (launchTimer.current !== null) window.clearTimeout(launchTimer.current);
    setLaunchingAwardId(award.id);
    launchTimer.current = window.setTimeout(() => {
      setLaunchingAwardId(null);
      onAwardSelect(award);
      launchTimer.current = null;
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520);
  };

  return (
    <section className="trophy-cabinet trophy-cabinet--wooden" aria-label="Athlete trophy cabinet">
      <header className="trophy-cabinet__header">
        <div>
          <span className="trophy-cabinet__eyebrow">THE HALL OF ACHIEVEMENT</span>
          <strong>{collectionName}</strong>
          <p>A collection built through effort, discipline and a little friendly competition.</p>
        </div>
        <div className="trophy-cabinet__count"><b>{String(awards.length).padStart(2, '0')}</b><span>AWARDS</span></div>
      </header>



      <div className="trophy-cabinet__stage">
        <svg className="trophy-cabinet__artboard" viewBox="0 0 1200 780" role="group" aria-label={`Wooden trophy cabinet with nine display compartments`}>
          <defs>
            <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
              {palette.wood.map((color, index) => <stop key={index} offset={['0', '.2', '.47', '.72', '1'][index]} stopColor={color} />)}
            </linearGradient>
            <linearGradient id="woodFront" x1="0" y1="0" x2="0" y2="1">
              {palette.front.map((color, index) => <stop key={index} offset={['0', '.18', '.55', '1'][index]} stopColor={color} />)}
            </linearGradient>
            <linearGradient id="woodEdge" x1="0" y1="0" x2="1" y2="0">
              {palette.edge.map((color, index) => <stop key={index} offset={['0', '.22', '.5', '.78', '1'][index]} stopColor={color} />)}
            </linearGradient>
            <linearGradient id="velvet" x1="0" y1="0" x2="1" y2="1">
              {palette.velvet.map((color, index) => <stop key={index} offset={['0', '.45', '1'][index]} stopColor={color} />)}
            </linearGradient>
            <linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1">
              {palette.shelf.map((color, index) => <stop key={index} offset={['0', '.12', '.5', '.9', '1'][index]} stopColor={color} />)}
            </linearGradient>
            <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d9f0f5" stopOpacity=".03" /><stop offset=".32" stopColor="#d9f0f5" stopOpacity=".13" /><stop offset=".52" stopColor="#ffffff" stopOpacity=".035" /><stop offset=".75" stopColor="#b9dce8" stopOpacity=".09" /><stop offset="1" stopColor="#d9f0f5" stopOpacity=".025" />
            </linearGradient>
            <linearGradient id="techGlass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#82cbd7" stopOpacity=".06" /><stop offset=".48" stopColor="#a6f0f3" stopOpacity=".17" /><stop offset="1" stopColor="#4db5c4" stopOpacity=".055" />
            </linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff0ad" /><stop offset=".22" stopColor="#e8c16e" /><stop offset=".5" stopColor="#a66e2b" /><stop offset=".76" stopColor="#f0ca79" /><stop offset="1" stopColor="#76501f" />
            </linearGradient>
            <linearGradient id="goldInner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1c0" /><stop offset=".5" stopColor="#d5a34c" /><stop offset="1" stopColor="#8c5a23" /></linearGradient>
            <linearGradient id="silverGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff8de" /><stop offset=".3" stopColor="#c8c6b8" /><stop offset=".65" stopColor="#7d8586" /><stop offset="1" stopColor="#e7d4a3" /></linearGradient>
            <linearGradient id="woodGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4a66a" /><stop offset=".45" stopColor="#80502c" /><stop offset="1" stopColor="#43271b" /></linearGradient>
            <radialGradient id="spot"><stop offset="0" stopColor={palette.spot} stopOpacity={'.22'} /><stop offset=".5" stopColor={palette.spot} stopOpacity=".08" /><stop offset="1" stopColor={palette.spot} stopOpacity="0" /></radialGradient>
            <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={palette.line} /><stop offset="1" stopColor={palette.lineDark} /></linearGradient>
            <pattern id="grain" width="180" height="90" patternUnits="userSpaceOnUse">
              <path d="M0 12 C48 5 88 19 180 8 M0 34 C55 27 105 42 180 30 M0 62 C48 54 112 72 180 57 M0 81 C58 76 118 87 180 76" fill="none" stroke="#e2b27d" strokeOpacity=".12" strokeWidth="2" />
              <path d="M0 23 C55 15 100 31 180 19 M0 70 C58 60 112 78 180 68" fill="none" stroke="#1d100c" strokeOpacity=".15" strokeWidth="3" />
            </pattern>
            <filter id="cabinetShadow" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="11" /><feOffset dy="12" /><feComponentTransfer><feFuncA type="linear" slope=".45" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="trophyShadow" x="-40%" y="-40%" width="180%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" /><feOffset dy="3" /><feComponentTransfer><feFuncA type="linear" slope=".55" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <ellipse cx="600" cy="752" rx="560" ry="18" fill="#050809" opacity=".45" />
          <g filter="url(#cabinetShadow)">
            {/* Main case and inset shadowline */}
            <rect x="42" y="28" width="1116" height="704" rx="5" fill={palette.case} stroke={palette.caseStroke} strokeWidth="8" />
            <rect x="54" y="40" width="1092" height="680" fill="url(#wood)" stroke={palette.trim} strokeWidth="5" />
            <rect x="54" y="40" width="1092" height="680" fill="url(#grain)" opacity=".75" />
            <rect x="90" y="91" width="1020" height="478" fill={palette.inner} stroke={palette.trim} strokeWidth="4" />
            <rect x="101" y="101" width="998" height="455" fill="url(#velvet)" />

            {/* Velvet bays, dim warm light and carved corner inlay */}
            {BAY_ROWS.map((row, rowIndex) => BAY_COLUMNS.map((centerX, colIndex) => {
              const bayX = centerX - 154;
              const bayY = row.top;
              const award = visibleAwards[rowIndex * BAY_COLUMNS.length + colIndex];
              return (
                <g key={`bay-${rowIndex}-${colIndex}`}>
                  <rect x={bayX} y={bayY} width="308" height="137" fill="url(#velvet)" stroke={palette.case} strokeWidth="3" />
                  <rect x={bayX + 5} y={bayY + 5} width="298" height="127" fill="none" stroke={palette.trim} strokeOpacity=".48" strokeWidth="1.3" />
                  <ellipse cx={centerX} cy={bayY + 48} rx="145" ry="115" fill="url(#spot)" />
                  <path d={`M${centerX - 2} ${bayY + 7} L${centerX - 2} ${bayY + 19}`} stroke="#f0d99f" strokeWidth="2" opacity=".65" />
                  <circle cx={centerX} cy={bayY + 11} r="7" fill={palette.line} stroke={palette.lineDark} strokeWidth="2" />
                  <circle cx={centerX} cy={bayY + 11} r="3" fill={palette.line} opacity=".8" />
                  <CornerDetails x={bayX + 9} y={bayY + 12} />
                  <CornerDetails x={bayX + 299} y={bayY + 12} flipX />
                  <CornerDetails x={bayX + 9} y={bayY + 125} flipY />
                  <CornerDetails x={bayX + 299} y={bayY + 125} flipX flipY />
                  {!award && <g className="cabinet-empty-plaque">
                    <rect x={centerX - 68} y={bayY + 103} width="136" height="19" rx="2" fill="url(#woodGold)" stroke="#d1a667" strokeWidth="1.5" />
                    <rect x={centerX - 60} y={bayY + 106} width="120" height="12" fill="#211813" stroke="#b58b55" strokeWidth=".7" />
                    <text x={centerX} y={bayY + 115} textAnchor="middle">A PLACE FOR YOUR NEXT WIN</text>
                  </g>}
                </g>
              );
            }))}

            {/* Side stiles, carved posts, plinth and crown molding */}
            <rect x="66" y="82" width="43" height="496" fill="url(#woodFront)" stroke="#2c1912" strokeWidth="3" />
            <rect x="1091" y="82" width="43" height="496" fill="url(#woodFront)" stroke="#2c1912" strokeWidth="3" />
            <rect x="74" y="88" width="8" height="478" fill="url(#gold)" opacity=".6" />
            <rect x="1110" y="88" width="8" height="478" fill="url(#gold)" opacity=".6" />
            <rect x="418" y="91" width="25" height="478" fill="url(#woodFront)" stroke="#301b13" strokeWidth="3" />
            <rect x="757" y="91" width="25" height="478" fill="url(#woodFront)" stroke="#301b13" strokeWidth="3" />
            <rect x="426" y="96" width="4" height="467" fill="url(#gold)" opacity=".5" />
            <rect x="765" y="96" width="4" height="467" fill="url(#gold)" opacity=".5" />

            {/* Shelves, built as thick furniture planks with beveled front rails */}
            {[240, 400, 560].map((y) => <g key={`shelf-${y}`}>
              <rect x="91" y={y - 9} width="1018" height="27" fill="#241711" opacity=".75" />
              <rect x="91" y={y - 14} width="1018" height="25" fill="url(#shelf)" stroke="#261711" strokeWidth="2" />
              <rect x="91" y={y - 15} width="1018" height="4" fill={palette.trim} opacity=".6" />
              <rect x="94" y={y + 7} width="1012" height="4" fill="#281811" opacity=".7" />
              <path d={`M98 ${y - 8} H1102`} stroke="#f0c58b" strokeOpacity=".27" strokeWidth="2" />
            </g>)}

            {/* Crown plaque and brass ornaments */}
            <rect x="42" y="28" width="1116" height="66" fill="url(#woodFront)" stroke="#1c100d" strokeWidth="3" />
            <rect x="58" y="38" width="1084" height="46" fill="none" stroke={palette.trim} strokeWidth="2" />
            <rect x="405" y="45" width="390" height="31" rx="2" fill="#2b1d18" stroke="#b98d55" strokeWidth="1.5" />
            <text x="600" y="65" className="cabinet-crown-title" textAnchor="middle">HALL OF ACHIEVEMENT</text>
            {[76, 1124].map((x) => <g key={`crown-stud-${x}`}><circle cx={x} cy="61" r="9" fill="url(#gold)" stroke="#5a391b" strokeWidth="2" /><circle cx={x} cy="61" r="3" fill="#fff0ba" /></g>)}

            {/* Lower collector's chest and inset drawers */}
            <rect x="58" y="575" width="1084" height="135" fill="url(#woodFront)" stroke="#21130f" strokeWidth="4" />
            <rect x="46" y="565" width="1108" height="22" fill="url(#shelf)" stroke="#2a1912" strokeWidth="3" />
            <rect x="53" y="565" width="1094" height="4" fill="#f0c38a" opacity=".65" />
            {[112, 468, 824].map((x, index) => <g key={`drawer-${index}`}>
              <rect x={x} y="601" width="264" height="83" fill="#261813" stroke="#c08a53" strokeWidth="3" />
              <rect x={x + 8} y="608" width="248" height="69" fill="url(#wood)" stroke="#d4a16a" strokeWidth="2" />
              <rect x={x + 15} y="614" width="234" height="56" fill="url(#grain)" opacity=".75" />
              <rect x={x + 22} y="620" width="220" height="2" fill="#e1b27a" opacity=".48" />
              <circle cx={x + 132} cy="643" r="11" fill="url(#gold)" stroke="#52351b" strokeWidth="2" />
              <circle cx={x + 132} cy="643" r="4" fill="#fff0bf" />
            </g>)}
            <rect x="48" y="708" width="1104" height="14" fill="#241611" />
            <rect x="40" y="719" width="1120" height="13" fill="url(#woodEdge)" stroke="#160d0a" strokeWidth="2" />
          </g>

          {/* Fixed event awards sit above the same small display plinth in each bay. */}
          {BAY_ROWS.map((row, rowIndex) => BAY_COLUMNS.map((centerX, colIndex) => {
            const award = visibleAwards[rowIndex * BAY_COLUMNS.length + colIndex];
            if (!award) return null;
            const isLaunching = launchingAwardId === award.id;
            const isSelected = selectedAwardId === award.id;
            return (
              <g key={award.id} transform={`translate(${centerX - 84} ${row.top + 1}) scale(.84)`}>
                <g
                  className={`cabinet-award ${isLaunching ? 'is-launching' : ''} ${isSelected ? 'is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${award.title}, ${award.event}, ${award.placement}`}
                  onClick={() => selectAward(award)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectAward(award);
                    }
                  }}
                >
                  <ellipse cx="100" cy="111" rx="76" ry="9" className="cabinet-award__shadow" />
                  <rect x="25" y="102" width="150" height="14" rx="2" fill="url(#woodGold)" stroke="#4c2d18" strokeWidth="2" />
                  <rect x="30" y="104" width="140" height="8" fill="#1d1714" stroke="#c1975b" strokeWidth="1" />
                  <TrophyArt type={award.type} />
                  <g className="cabinet-award__plaque">
                    <rect x="27" y="119" width="146" height="22" rx="2" fill="url(#woodGold)" stroke="#d2a76b" strokeWidth="1.5" />
                    <rect x="33" y="122" width="134" height="15" fill="#241914" stroke="#8b623a" strokeWidth=".8" />
                    <text x="100" y="132" textAnchor="middle" className="cabinet-award__title">{award.title.toUpperCase().slice(0, 22)}</text>
                  </g>
                </g>
              </g>
            );
          }))}
        </svg>
        <div className="trophy-cabinet__hint"><span className="trophy-cabinet__hint-dot" /> SELECT A TROPHY TO OPEN ITS STORY</div>
      </div>

      <footer className="trophy-cabinet__footer">
        <span>✦ HAND-FINISHED DISPLAY · ONE COLLECTION, MANY STORIES</span>
        <span>{Math.min(awards.length, MAX_AWARDS)} OF {MAX_AWARDS} DISPLAY PLACES FILLED</span>
      </footer>
    </section>
  );
}

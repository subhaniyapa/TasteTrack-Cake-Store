// Illustrated cakes. Used when a cake has no photo, and for the home page.
// variantOf() picks the picture from the cake's name / category, toneOf() picks the colour.

const INK = '#2B2730';

// [frosting, accent, background]
const tones = [
  ['#F0C6D2', '#B76E86', '#FBEFF2'],
  ['#DCCBEA', '#8466A3', '#F5EFF9'],
  ['#C9DFD0', '#5F8A75', '#EFF6F1'],
  ['#F2D8A8', '#C0903F', '#FBF3E3'],
  ['#C5DBEC', '#5B86AD', '#EDF4FA'],
];

export const toneOf = (name = '') => [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % tones.length;

export function variantOf(product = {}) {
  const t = `${product.name || ''} ${product.category?.name || ''}`.toLowerCase();
  if (/wedding|tier/.test(t)) return 'wedding';
  if (/cupcake|muffin/.test(t)) return 'cupcake';
  if (/cheesecake/.test(t)) return 'cheesecake';
  if (/chocolate|fudge|brownie|mocha|oreo/.test(t)) return 'chocolate';
  if (/loaf|tea time|lemon|drizzle|pound/.test(t)) return 'loaf';
  if (/ribbon/.test(t)) return 'ribbon';
  return 'layer';
}

/* ---------- shared pieces ---------- */

function Stage({ bg, children }) {
  return (
    <>
      <rect width="240" height="240" fill={bg} />
      <circle cx="120" cy="110" r="92" fill="#fff" opacity="0.6" />
      <ellipse cx="120" cy="208" rx="86" ry="10" fill={INK} opacity="0.1" />
      <ellipse cx="120" cy="198" rx="84" ry="9" fill="#fff" stroke="#E4DDE1" strokeWidth="1" />
      {children}
    </>
  );
}

// A band of frosting with drips running down the side
function Drips({ x, y, w, color, heights, step = 14, dw = 9, band = 10 }) {
  const n = Math.floor((w - 8 - dw) / step) + 1;
  const start = x + (w - ((n - 1) * step + dw)) / 2;
  return (
    <g fill={color}>
      <rect x={x} y={y} width={w} height={band} rx={band / 2} />
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={start + i * step} y={y + band / 2} width={dw} height={heights[i % heights.length]} rx={dw / 2} />
      ))}
    </g>
  );
}

const Flame = ({ x, y }) => <path d={`M${x} ${y} q-8 10 0 17 q8 -7 0 -17z`} fill="#F5B942" />;
const Shine = ({ cx, cy, r }) => <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.28} fill="#fff" opacity="0.6" />;

/* ---------- the seven cakes ---------- */

function Layer({ a, b, bg }) {
  return (
    <Stage bg={bg}>
      <rect x="50" y="138" width="140" height="58" rx="10" fill={a} />
      <rect x="50" y="158" width="140" height="6" fill="#fff" opacity="0.75" />
      <rect x="50" y="178" width="140" height="6" fill="#fff" opacity="0.75" />
      <Drips x={50} y={134} w={140} color="#fff" heights={[14, 22, 12, 26, 16, 20]} />
      <rect x="76" y="98" width="88" height="42" rx="9" fill={a} />
      <rect x="76" y="118" width="88" height="6" fill="#fff" opacity="0.75" />
      <Drips x={76} y={94} w={88} color="#fff" heights={[12, 20, 14, 18]} />
      {[[92, 99, 20], [108, 100, -30], [134, 99, 40], [150, 100, -10]].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="8" height="3" rx="1.5" fill={b} transform={`rotate(${r} ${x + 4} ${y + 1.5})`} />
      ))}
      <rect x="117" y="68" width="6" height="27" rx="3" fill={b} />
      <Flame x={120} y={52} />
    </Stage>
  );
}

function Chocolate({ b, bg }) {
  return (
    <Stage bg={bg}>
      <rect x="58" y="106" width="124" height="90" rx="12" fill="#6B4A3A" />
      <rect x="58" y="134" width="124" height="6" fill="#F3E6D8" />
      <rect x="58" y="162" width="124" height="6" fill="#F3E6D8" />
      <Drips x={58} y={102} w={124} color="#3A2A22" heights={[18, 30, 14, 34, 20, 26, 16]} band={12} />
      <path d="M96 84 q4 -14 16 -20" stroke="#4B6B3A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M134 82 q-2 -14 -12 -18" stroke="#4B6B3A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="96" cy="94" r="11" fill="#B3261E" />
      <Shine cx={96} cy={94} r={11} />
      <circle cx="134" cy="92" r="11" fill="#B3261E" />
      <Shine cx={134} cy={92} r={11} />
      {[[112, 98, 25], [118, 94, -35], [154, 100, 60]].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="14" height="4" rx="2" fill="#3A2A22" transform={`rotate(${r} ${x + 7} ${y + 2})`} />
      ))}
      <circle cx="160" cy="98" r="5" fill={b} />
    </Stage>
  );
}

function Cheesecake({ b, bg }) {
  return (
    <Stage bg={bg}>
      <rect x="56" y="132" width="128" height="62" rx="6" fill="#F6E5C3" />
      <rect x="56" y="174" width="128" height="20" rx="6" fill="#B98A5A" />
      <rect x="56" y="174" width="128" height="8" fill="#B98A5A" />
      <ellipse cx="120" cy="132" rx="64" ry="17" fill="#FBF0D9" stroke="#EBD9B2" strokeWidth="1" />
      <ellipse cx="120" cy="132" rx="48" ry="11" fill={b} opacity="0.85" />
      {[[100, 128, 7, '#5B3A8C'], [118, 123, 7, '#C0392B'], [137, 128, 7, '#3E5C9A'], [110, 135, 6, '#C0392B'], [128, 135, 6, '#5B3A8C']].map(([x, y, r, c], i) => (
        <g key={i}><circle cx={x} cy={y} r={r} fill={c} /><Shine cx={x} cy={y} r={r} /></g>
      ))}
      <path d="M120 112 q-10 -6 -14 2 q8 6 14 -2z" fill="#7FA88E" />
      <path d="M120 112 q10 -6 14 2 q-8 6 -14 -2z" fill="#6A9779" />
    </Stage>
  );
}

function Cup({ cx, y, wrap, frost, top }) {
  return (
    <g>
      <path d={`M${cx - 24} ${y} H${cx + 24} L${cx + 18} ${y + 40} H${cx - 18} Z`} fill={wrap} />
      {[-12, -4, 4, 12].map((dx) => (
        <path key={dx} d={`M${cx + dx} ${y + 3} L${cx + dx * 0.75} ${y + 37}`} stroke="#fff" opacity="0.45" strokeWidth="1.6" />
      ))}
      <ellipse cx={cx} cy={y} rx="28" ry="9" fill={frost} />
      <ellipse cx={cx} cy={y - 10} rx="22" ry="8" fill={frost} />
      <ellipse cx={cx} cy={y - 19} rx="15" ry="7" fill={frost} />
      <path d={`M${cx - 6} ${y - 23} q6 -14 12 0z`} fill={frost} />
      <circle cx={cx} cy={y - 28} r="5" fill={top} />
      <Shine cx={cx} cy={y - 28} r={5} />
    </g>
  );
}

function Cupcake({ a, b, bg }) {
  return (
    <Stage bg={bg}>
      <Cup cx={64} y={158} wrap={b} frost={a} top="#B3261E" />
      <Cup cx={176} y={158} wrap={b} frost="#FFF4E0" top="#B3261E" />
      <g transform="translate(120 152) scale(1.2) translate(-120 -152)">
        <Cup cx={120} y={152} wrap="#8A6A55" frost="#fff" top={b} />
      </g>
    </Stage>
  );
}

function Wedding({ b, bg }) {
  const tier = (x, y, w, h) => <rect x={x} y={y} width={w} height={h} rx="8" fill="#fff" stroke="#E4DDE1" strokeWidth="1.2" />;
  return (
    <Stage bg={bg}>
      {tier(48, 148, 144, 48)}
      {tier(68, 108, 104, 42)}
      {tier(88, 74, 64, 36)}
      <rect x="48" y="176" width="144" height="8" fill={b} opacity="0.9" />
      <rect x="68" y="136" width="104" height="7" fill={b} opacity="0.9" />
      <rect x="88" y="100" width="64" height="6" fill={b} opacity="0.9" />
      {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={58 + i * 14.8} cy={157} r="2.6" fill="#E3D8DE" />)}
      {Array.from({ length: 7 }).map((_, i) => <circle key={i} cx={77 + i * 14.5} cy={117} r="2.4" fill="#E3D8DE" />)}
      <ellipse cx="102" cy="68" rx="12" ry="4" fill="#7FA88E" transform="rotate(-20 102 68)" />
      <ellipse cx="138" cy="68" rx="12" ry="4" fill="#7FA88E" transform="rotate(20 138 68)" />
      {[[112, 64], [128, 64], [120, 55]].map(([x, y], i) => (
        <g key={i}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={x + 6 * Math.cos((a * Math.PI) / 180)} cy={y + 6 * Math.sin((a * Math.PI) / 180)} r="5" fill={b} opacity="0.9" />
          ))}
          <circle cx={x} cy={y} r="3.2" fill="#F5B942" />
        </g>
      ))}
    </Stage>
  );
}

function Lemon({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="15" fill="#F4D35E" />
      <circle cx={cx} cy={cy} r="12" fill="#FBE98A" />
      {[0, 60, 120].map((a) => (
        <line key={a} x1={cx - 11 * Math.cos((a * Math.PI) / 180)} y1={cy - 11 * Math.sin((a * Math.PI) / 180)} x2={cx + 11 * Math.cos((a * Math.PI) / 180)} y2={cy + 11 * Math.sin((a * Math.PI) / 180)} stroke="#F4D35E" strokeWidth="1.8" />
      ))}
      <circle cx={cx} cy={cy} r="2.5" fill="#F4D35E" />
    </g>
  );
}

function Loaf({ bg }) {
  return (
    <Stage bg={bg}>
      <rect x="42" y="118" width="156" height="78" rx="24" fill="#E3B766" />
      <rect x="54" y="168" width="132" height="4" rx="2" fill="#fff" opacity="0.25" />
      <Drips x={48} y={115} w={144} color="#FFF7E6" heights={[16, 26, 12, 22, 30, 14]} band={12} />
      <Lemon cx={94} cy={110} />
      <Lemon cx={146} cy={106} />
      <path d="M118 96 q-6 -12 4 -16 q6 8 -4 16z" fill="#7FA88E" />
    </Stage>
  );
}

function Ribbon({ a, b, bg }) {
  return (
    <Stage bg={bg}>
      <rect x="52" y="120" width="136" height="76" rx="10" fill="#F7EBD3" />
      <rect x="52" y="150" width="136" height="24" fill="#7A5446" />
      <path d="M52 152 V130 a10 10 0 0 1 10 -10 H178 a10 10 0 0 1 10 10 V152 Z" fill="#F2B8C6" />
      {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={62 + i * 14.5} cy={120} r="8" fill="#fff" />)}
      <rect x="54" y="116" width="132" height="8" rx="4" fill="#fff" />
      <circle cx="120" cy="106" r="10" fill={b} />
      <Shine cx={120} cy={106} r={10} />
      <path d="M120 96 q-3 -10 8 -12 q2 8 -8 12z" fill="#7FA88E" />
      {[88, 152].map((x) => <circle key={x} cx={x} cy={112} r="4" fill={a} />)}
    </Stage>
  );
}

const ART = { layer: Layer, chocolate: Chocolate, cheesecake: Cheesecake, cupcake: Cupcake, wedding: Wedding, loaf: Loaf, ribbon: Ribbon };

export default function CakeArt({ variant = 'layer', tone = 0, className = '' }) {
  const [a, b, bg] = tones[tone % tones.length];
  const Art = ART[variant] || Layer;
  return (
    <svg className={className} viewBox="0 0 240 240" role="img" aria-label="Illustration of a cake" preserveAspectRatio="xMidYMid slice">
      <Art a={a} b={b} bg={bg} />
    </svg>
  );
}

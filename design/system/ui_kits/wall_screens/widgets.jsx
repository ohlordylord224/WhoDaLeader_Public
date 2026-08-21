/* ============================================================
   WHOSDALEADER — WALL SCREEN WIDGETS (TV-scale layer)
   Five widget types (Leaderboard, Spotlight, Target, Ticker,
   Trend), each working at quarter / half / full cell sizes,
   plus the shared WallShell chrome. Composes DS components
   from window.WhosdaleaderDesignSystem_012310; all styling
   lives in wall.css against the system's semantic tokens.
   ============================================================ */

const WDS = window.WhosdaleaderDesignSystem_012310;
const { Badge, Avatar, RankBadge, ProgressBar } = WDS;

function useWallClock() {
  const [t, setT] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/* "Priya Anand" → "Priya A." for tight slots */
function shortName(name = '') {
  const p = name.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[1][0]}.` : name;
}

/* The crown from assets/emblem.svg, as an inline glyph.
   AMENDED EMOJI RULE: this is the ONLY pictorial mark allowed —
   it marks the current #1 on leaderboards and spotlights, nothing else. */
function Crown({ size = 30 }) {
  return (
    <svg className="crown" width={size} height={Math.round(size * 0.62)} viewBox="20.2 13.9 23.6 14.2" role="img" aria-label="Current leader">
      <path d="M22 27 L22 18.5 L27 22 L32 15.5 L37 22 L42 18.5 L42 27 Z" fill="var(--rank-1)" stroke="var(--rank-1)" strokeWidth="1.6" strokeLinejoin="round"></path>
    </svg>
  );
}

/* StatDelta semantics at 10-foot scale. Direction colors are sacred. */
function TvDelta({ value, suffix = '%', pill = false, lg = false }) {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  const dir = isNaN(n) || n === 0 ? 'flat' : n > 0 ? 'up' : 'down';
  const glyph = { up: '▲', down: '▼', flat: '—' }[dir];
  const cls = ['tvd', `tvd--${dir}`, pill ? 'tvd--pill' : '', lg ? 'tvd--lg' : ''].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      <span className="tvd__arrow" aria-hidden="true">{glyph}</span>
      {dir === 'flat' ? 'holding' : `${Math.abs(n)}${suffix}`}
    </span>
  );
}

/* Minimal header chrome per WallChrome: wordmark, period chip, clock, LIVE. */
function WallShell({ label, period = 'This week', clock, stale = null, children }) {
  return (
    <div className="wall" data-screen-label={label}>
      <header className="wall__head">
        <div className="wall__brand">
          <img src="../../assets/emblem.svg" alt="Whosdaleader" width="56" height="56" />
          <span className="wall__wordmark">Whos<span className="wall__da">da</span>leader</span>
        </div>
        <div className="wall__meta">
          <span className="wall__period">{period}</span>
          <span className="wall__div"></span>
          <span className="wall__clock wdl-num">{clock}</span>
          <Badge live size="lg">LIVE</Badge>
        </div>
      </header>
      <main className="wall__grid">{children}</main>
      {stale ? <StaleChip at={typeof stale === 'string' ? stale : null} /> : null}
    </div>
  );
}

/* One grid cell. size: 'quarter' (1 cell) | 'half' (full column) | 'full' (all 4). */
function Cell({ title, aside = null, size = 'quarter', label, children }) {
  return (
    <section className={`cell cell--${size}`} data-screen-label={label || title}>
      {title ? (
        <header className="cell__head">
          <h2 className="cell__title">{title}</h2>
          {aside}
        </header>
      ) : null}
      <div className="cell__body">{children}</div>
    </section>
  );
}

const BOARD_COUNT = { quarter: 3, half: 6, full: 10 };
const RING = { 1: 'gold', 2: 'silver', 3: 'bronze' };

function BoardRow({ rank, rep, metric, size, celebrate = false }) {
  const lead = rank === 1;
  const move = rep.move || 0;
  const moveDir = move > 0 ? 'up' : move < 0 ? 'down' : 'flat';
  const cls = ['brd__row', lead ? 'brd__row--lead' : '', celebrate ? 'brd__row--celebrate' : ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <RankBadge rank={rank} size={size === 'quarter' ? 'md' : 'lg'} />
      {size !== 'quarter' ? (
        <span className={`brd__move brd__move--${moveDir}`}>
          {move > 0 ? '▲' : move < 0 ? '▼' : '–'}{move !== 0 ? Math.abs(move) : ''}
        </span>
      ) : null}
      <Avatar name={rep.name} size={size === 'quarter' ? 'md' : 'lg'} ring={celebrate ? 'up' : RING[rank] || null} />
      <span className="brd__name">
        {lead ? <Crown size={size === 'quarter' ? 26 : 32} /> : null}
        <span className="brd__nametext">{shortName(rep.name)}</span>
      </span>
      <span className="brd__value">{metric.fmt(rep[metric.key])}</span>
      <span className="brd__delta"><TvDelta value={rep[metric.delta]} pill={lead} /></span>
    </div>
  );
}

/* 1 — Leaderboard. Quarter: top 3 · Half: top 6 · Full: top 10 (two columns). */
function Leaderboard({ reps, metric, size = 'half', celebrate = false }) {
  const rows = [...reps].sort((a, b) => b[metric.key] - a[metric.key]).slice(0, BOARD_COUNT[size]);
  return (
    <div className={`brd brd--${size}`}>
      {rows.map((rep, i) => (
        <BoardRow key={rep.name} rank={i + 1} rep={rep} metric={metric} size={size} celebrate={celebrate && i === 0} />
      ))}
    </div>
  );
}

/* 2 — Spotlight. One name + one huge number + 1–2 word label. */
function Spotlight({ label, name, value, delta, crowned = false }) {
  const big = String(value).length <= 5;
  return (
    <div className="spot">
      <span className="wall-eyebrow">{label}</span>
      <span className={`spot__value${big ? ' spot__value--xl' : ''}`}>{value}</span>
      <span className="spot__name">
        <Avatar name={name} size="lg" ring={crowned ? 'gold' : null} />
        {crowned ? <Crown size={32} /> : null}
        {name}
      </span>
      {delta != null ? <TvDelta value={delta} pill /> : null}
    </div>
  );
}

/* 3 — Target. Percent + candy fill + "£340k / £500k" + days left. */
function TargetWidget({ pct, current, goal, daysLeft }) {
  return (
    <div className="tgt">
      <div className="tgt__pct">{pct}%</div>
      <ProgressBar value={pct} size="lg" tone="gold" />
      <div className="tgt__meta">
        <span className="tgt__frac"><b>{current}</b> / {goal}</span>
        <span className="tgt__days">{daysLeft} days left</span>
      </div>
    </div>
  );
}

/* 4 — Ticker. Recent wins in the system voice; empty state when quiet. */
function Ticker({ wins = [], empty = false }) {
  if (empty || !wins.length) {
    return (
      <div className="tick tick--empty">
        <p>No deals yet today — first one sets the pace.</p>
      </div>
    );
  }
  return (
    <div className="tick">
      {wins.map((w, i) => (
        <div className="tick__row" key={i}>
          <span className={`tick__dot tick__dot--${w.tone}`}></span>
          <span className="tick__text"><b>{w.who}</b> {w.what}</span>
          <span className={`tick__amt wdl-num tick__amt--${w.tone}`}>{w.amount}</span>
          <span className="tick__time wdl-num">{w.time}</span>
        </div>
      ))}
    </div>
  );
}

/* 5 — Trend. This period vs same point last period. */
function Trend({ data }) {
  const max = Math.max(...data.days.flatMap((d) => [d.now, d.prev]));
  return (
    <div className="trend">
      <div className="trend__hero">
        <div className="trend__stat">
          <span className="trend__key"><i className="trend__sw trend__sw--now"></i><span className="wall-eyebrow">This week</span></span>
          <span className="trend__big">{data.now}</span>
        </div>
        <div className="trend__stat trend__stat--prev">
          <span className="trend__key"><i className="trend__sw trend__sw--prev"></i><span className="wall-eyebrow">Last week</span></span>
          <span className="trend__big">{data.prev}</span>
        </div>
        <TvDelta value={data.delta} pill lg />
      </div>
      <div className="trend__chart">
        {data.days.map((d) => (
          <div className="trend__day" key={d.d}>
            <div className="trend__bars">
              <div className="trend__bar trend__bar--prev" style={{ height: `${Math.round((d.prev / max) * 100)}%` }}></div>
              <div className="trend__bar trend__bar--now" style={{ height: `${Math.round((d.now / max) * 100)}%` }}></div>
            </div>
            <span className="trend__lbl">{d.d}</span>
          </div>
        ))}
      </div>
      <div className="trend__rows">
        {data.rows.map((r) => (
          <div className="trend__metric" key={r.label}>
            <span className="trend__mlabel">{r.label}</span>
            <span className="trend__mval">{r.value}</span>
            <TvDelta value={r.delta} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Celebration banner for the overtake moment. */
function OvertakeBanner({ children }) {
  return (
    <div className="ovt">
      <span className="ovt__glyph" aria-hidden="true">▲</span>
      <span>{children}</span>
    </div>
  );
}

/* Quiet reconnecting chip — corner, body-copy size allowed. */
function StaleChip({ at }) {
  return (
    <div className="stale">
      <span className="stale__dot" aria-hidden="true"></span>
      Reconnecting{at ? <span className="wdl-num">&nbsp;· {at}</span> : null}
    </div>
  );
}

function fitWallCanvas() {
  const c = document.getElementById('canvas');
  const fit = () => {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    c.style.transform = `scale(${s})`;
  };
  fit();
  window.addEventListener('resize', fit);
}

Object.assign(window, {
  useWallClock, shortName, Crown, TvDelta,
  WallShell, Cell, Leaderboard, Spotlight, TargetWidget, Ticker, Trend,
  OvertakeBanner, StaleChip, fitWallCanvas,
});

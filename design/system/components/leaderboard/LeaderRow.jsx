import React from 'react';
import { RankBadge } from './RankBadge.jsx';
import { StatDelta } from './StatDelta.jsx';
import { ProgressBar } from './ProgressBar.jsx';
import { Avatar } from '../core/Avatar.jsx';

const CSS = `
.wdl-leaderrow{ display:flex; align-items:center; gap:16px; padding:14px 18px;
  background:var(--surface-card); border:1px solid var(--border-subtle); border-radius:var(--radius-lg);
  transition:background var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out); }
.wdl-leaderrow:hover{ background:var(--surface-card-hi); }
.wdl-leaderrow--lead{ box-shadow:var(--shadow-card), var(--glow-gold); border-color:transparent;
  background:linear-gradient(100deg, color-mix(in srgb, var(--gold-400) 12%, var(--surface-card)), var(--surface-card) 60%); }
.wdl-leaderrow__move{ display:inline-flex; align-items:center; gap:2px; width:38px; flex:none;
  font-family:var(--font-numeric); font-weight:700; font-size:12px; justify-content:center; }
.wdl-leaderrow__move--up{ color:var(--up); } .wdl-leaderrow__move--down{ color:var(--down); } .wdl-leaderrow__move--flat{ color:var(--text-faint); }
.wdl-leaderrow__id{ display:flex; flex-direction:column; gap:2px; min-width:0; }
.wdl-leaderrow__name{ font-family:var(--font-display); font-weight:700; font-size:18px; color:var(--text-strong);
  letter-spacing:-0.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wdl-leaderrow__team{ font-family:var(--font-body); font-size:13px; color:var(--text-muted); white-space:nowrap; }
.wdl-leaderrow__bar{ flex:1; min-width:60px; max-width:320px; }
.wdl-leaderrow__metric{ display:flex; flex-direction:column; align-items:flex-end; gap:3px; margin-left:auto; flex:none; }
.wdl-leaderrow__value{ font-family:var(--font-numeric); font-variant-numeric:tabular-nums; font-weight:700;
  font-size:24px; line-height:1; color:var(--text-strong); letter-spacing:-0.02em; }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

const RING = { 1: 'gold', 2: 'silver', 3: 'bronze' };

export function LeaderRow({
  rank, name, team, avatarSrc, value, delta, movement = 0,
  progress, lead = false, className = '', ...rest
}) {
  useStyleOnce('wdl-leaderrow-css', CSS);
  const moveDir = movement > 0 ? 'up' : movement < 0 ? 'down' : 'flat';
  const moveGlyph = movement > 0 ? '▲' : movement < 0 ? '▼' : '–';
  const cls = ['wdl-leaderrow', lead ? 'wdl-leaderrow--lead' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      <RankBadge rank={rank} size={lead ? 'lg' : 'md'} />
      <span className={`wdl-leaderrow__move wdl-leaderrow__move--${moveDir}`}>
        {moveGlyph}{movement !== 0 ? Math.abs(movement) : ''}
      </span>
      <Avatar name={name} src={avatarSrc} size={lead ? 'lg' : 'md'} ring={RING[rank] || null} />
      <div className="wdl-leaderrow__id">
        <span className="wdl-leaderrow__name">{name}</span>
        {team ? <span className="wdl-leaderrow__team">{team}</span> : null}
      </div>
      {progress ? (
        <div className="wdl-leaderrow__bar">
          <ProgressBar value={progress.value} max={progress.max || 100} tone={progress.tone || (lead ? 'gold' : 'brand')} size="sm" />
        </div>
      ) : null}
      <div className="wdl-leaderrow__metric">
        <span className="wdl-leaderrow__value">{value}</span>
        {delta != null ? <StatDelta value={delta} suffix="%" size="sm" /> : null}
      </div>
    </div>
  );
}

import React from 'react';

const CSS = `
.wdl-rank{
  display:inline-flex; align-items:center; justify-content:center; flex:none;
  font-family:var(--font-display); font-weight:800; font-variant-numeric:tabular-nums;
  border-radius:var(--radius-md); background:var(--surface-card-hi); color:var(--text-muted);
  border:1px solid var(--border-default);
}
.wdl-rank--sm{ width:30px; height:30px; font-size:14px; border-radius:var(--radius-sm); }
.wdl-rank--md{ width:42px; height:42px; font-size:19px; }
.wdl-rank--lg{ width:60px; height:60px; font-size:28px; border-radius:var(--radius-lg); }
.wdl-rank--1{ background:var(--rank-1); color:#2c1d00; border-color:transparent; box-shadow:var(--glow-gold); }
.wdl-rank--2{ background:var(--rank-2); color:#1c2333; border-color:transparent; }
.wdl-rank--3{ background:var(--rank-3); color:#3a1e08; border-color:transparent; }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function RankBadge({ rank, size = 'md', className = '', ...rest }) {
  useStyleOnce('wdl-rank-css', CSS);
  const medal = rank >= 1 && rank <= 3 ? `wdl-rank--${rank}` : '';
  const cls = ['wdl-rank', `wdl-rank--${size}`, medal, className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{rank}</span>;
}

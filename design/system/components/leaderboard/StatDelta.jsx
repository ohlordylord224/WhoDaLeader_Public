import React from 'react';

const CSS = `
.wdl-delta{ display:inline-flex; align-items:center; gap:5px; font-family:var(--font-numeric);
  font-variant-numeric:tabular-nums; font-weight:700; line-height:1; white-space:nowrap; }
.wdl-delta--sm{ font-size:13px; } .wdl-delta--md{ font-size:15px; } .wdl-delta--lg{ font-size:20px; }
.wdl-delta__arrow{ font-size:0.92em; }
.wdl-delta--up{ color:var(--up); } .wdl-delta--down{ color:var(--down); } .wdl-delta--flat{ color:var(--flat); }
.wdl-delta--pill{ padding:5px 10px; border-radius:var(--radius-pill); }
.wdl-delta--pill.wdl-delta--up{ background:var(--up-soft); color:var(--up-bright); }
.wdl-delta--pill.wdl-delta--down{ background:var(--down-soft); color:var(--down-bright); }
.wdl-delta--pill.wdl-delta--flat{ background:var(--flat-soft); color:var(--text-muted); }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

const ARROWS = { up: '▲', down: '▼', flat: '—' };

export function StatDelta({ value, direction, variant = 'text', size = 'md', showArrow = true, suffix = '', className = '', children, ...rest }) {
  useStyleOnce('wdl-delta-css', CSS);
  let dir = direction;
  if (!dir) {
    const n = typeof value === 'number' ? value : parseFloat(String(value));
    dir = isNaN(n) || n === 0 ? 'flat' : n > 0 ? 'up' : 'down';
  }
  const cls = ['wdl-delta', `wdl-delta--${dir}`, `wdl-delta--${size}`, variant === 'pill' ? 'wdl-delta--pill' : '', className].filter(Boolean).join(' ');
  const display = children != null ? children
    : (typeof value === 'number' ? `${Math.abs(value)}${suffix}` : value);
  return (
    <span className={cls} {...rest}>
      {showArrow ? <span className="wdl-delta__arrow" aria-hidden="true">{ARROWS[dir]}</span> : null}
      {display}
    </span>
  );
}

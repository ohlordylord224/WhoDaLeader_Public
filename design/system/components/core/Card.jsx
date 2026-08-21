import React from 'react';

const CSS = `
.wdl-card{
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-xl); box-shadow:var(--shadow-card); padding:var(--card-padding);
  color:var(--text-body); transition:transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.wdl-card--flush{ padding:0; overflow:hidden; }
.wdl-card--interactive{ cursor:pointer; }
.wdl-card--interactive:hover{ transform:translateY(-3px); box-shadow:var(--shadow-pop); border-color:var(--border-strong); }
.wdl-card--glow-brand{ box-shadow:var(--shadow-card), var(--glow-brand); border-color:transparent; }
.wdl-card--glow-gold{ box-shadow:var(--shadow-card), var(--glow-gold); border-color:transparent; }
.wdl-card--glow-up{ box-shadow:var(--shadow-card), var(--glow-up); border-color:transparent; }
.wdl-card--glow-down{ box-shadow:var(--shadow-card), var(--glow-down); border-color:transparent; }
.wdl-card__head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
.wdl-card__title{ font-family:var(--font-display); font-weight:800; font-size:18px; color:var(--text-strong); letter-spacing:-0.01em; white-space:nowrap; }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function Card({ glow = null, interactive = false, flush = false, title, action, className = '', children, ...rest }) {
  useStyleOnce('wdl-card-css', CSS);
  const cls = [
    'wdl-card',
    flush ? 'wdl-card--flush' : '',
    interactive ? 'wdl-card--interactive' : '',
    glow ? `wdl-card--glow-${glow}` : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {(title || action) ? (
        <div className="wdl-card__head">
          {title ? <span className="wdl-card__title">{title}</span> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

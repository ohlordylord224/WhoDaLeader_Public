import React from 'react';

const CSS = `
.wdl-badge{
  display:inline-flex; align-items:center; gap:6px; font-family:var(--font-body);
  font-weight:700; font-size:12px; line-height:1; letter-spacing:.02em;
  padding:5px 11px; border-radius:var(--radius-pill); border:1px solid transparent; white-space:nowrap;
}
.wdl-badge--lg{ font-size:13px; padding:7px 14px; }
.wdl-badge__dot{ width:7px; height:7px; border-radius:50%; background:currentColor; }
.wdl-badge--neutral{ background:var(--surface-card-hi); color:var(--text-muted); border-color:var(--border-default); }
.wdl-badge--brand{ background:var(--brand-soft); color:var(--brand-bright); }
.wdl-badge--up{ background:var(--up-soft); color:var(--up-bright); }
.wdl-badge--down{ background:var(--down-soft); color:var(--down-bright); }
.wdl-badge--gold{ background:var(--rank-1-soft); color:var(--rank-1); }
.wdl-badge--info{ background:var(--sky-soft); color:var(--sky-400); }
.wdl-badge--solid-up{ background:var(--up); color:#08130d; }
.wdl-badge--solid-down{ background:var(--down); color:#fff; }
.wdl-badge--solid-gold{ background:var(--rank-1); color:#2c1d00; }
.wdl-badge--live{ background:var(--down); color:#fff; }
.wdl-badge--live .wdl-badge__dot{ animation:wdl-pulse 1.4s var(--ease-in-out) infinite; }
@keyframes wdl-pulse{ 0%,100%{opacity:1;} 50%{opacity:.35;} }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function Badge({ tone = 'neutral', size = 'md', dot = false, live = false, className = '', children, ...rest }) {
  useStyleOnce('wdl-badge-css', CSS);
  const cls = [
    'wdl-badge',
    `wdl-badge--${live ? 'live' : tone}`,
    size === 'lg' ? 'wdl-badge--lg' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {(dot || live) ? <span className="wdl-badge__dot" aria-hidden="true"></span> : null}
      {children}
    </span>
  );
}

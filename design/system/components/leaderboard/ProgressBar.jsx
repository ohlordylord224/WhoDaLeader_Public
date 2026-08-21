import React from 'react';

const CSS = `
.wdl-prog{ display:flex; flex-direction:column; gap:7px; width:100%; }
.wdl-prog__top{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.wdl-prog__label{ font-family:var(--font-body); font-weight:600; font-size:13px; color:var(--text-muted); }
.wdl-prog__val{ font-family:var(--font-numeric); font-variant-numeric:tabular-nums; font-weight:700; font-size:13px; color:var(--text-body); }
.wdl-prog__track{ position:relative; width:100%; background:var(--slate-800); border-radius:var(--radius-pill); overflow:hidden; }
.wdl-prog--sm .wdl-prog__track{ height:8px; }
.wdl-prog--md .wdl-prog__track{ height:12px; }
.wdl-prog--lg .wdl-prog__track{ height:18px; }
.wdl-prog__fill{ height:100%; border-radius:var(--radius-pill);
  transition:width var(--dur-slow) var(--ease-out); }
.wdl-prog__fill--brand{ background:linear-gradient(90deg, var(--azure-500), var(--azure-bright)); }
.wdl-prog__fill--up{ background:linear-gradient(90deg, var(--mint-500), var(--mint-bright)); }
.wdl-prog__fill--down{ background:linear-gradient(90deg, var(--coral-500), var(--coral-bright)); }
.wdl-prog__fill--gold{ background:linear-gradient(90deg, var(--gold-500), var(--gold-bright)); }
.wdl-prog__fill--sky{ background:linear-gradient(90deg, var(--sky-500), var(--sky-400)); }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function ProgressBar({ value = 0, max = 100, tone = 'brand', size = 'md', label, valueLabel, showValue = false, className = '', ...rest }) {
  useStyleOnce('wdl-prog-css', CSS);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const cls = ['wdl-prog', `wdl-prog--${size}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {(label || showValue || valueLabel) ? (
        <div className="wdl-prog__top">
          {label ? <span className="wdl-prog__label">{label}</span> : <span />}
          {(showValue || valueLabel) ? <span className="wdl-prog__val">{valueLabel != null ? valueLabel : `${Math.round(pct)}%`}</span> : null}
        </div>
      ) : null}
      <div className="wdl-prog__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={`wdl-prog__fill wdl-prog__fill--${tone}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}

import React from 'react';
import { StatDelta } from './StatDelta.jsx';

const CSS = `
.wdl-tile{ display:flex; flex-direction:column; gap:10px; background:var(--surface-card);
  border:1px solid var(--border-subtle); border-radius:var(--radius-xl); padding:20px 22px;
  box-shadow:var(--shadow-card); min-width:0; }
.wdl-tile__top{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.wdl-tile__label{ font-family:var(--font-body); font-weight:700; font-size:12px; letter-spacing:.1em;
  text-transform:uppercase; color:var(--text-muted); }
.wdl-tile__icon{ display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px;
  border-radius:var(--radius-md); background:var(--brand-soft); color:var(--brand-bright); flex:none; }
.wdl-tile__icon svg{ width:20px; height:20px; }
.wdl-tile__icon--up{ background:var(--up-soft); color:var(--up-bright); }
.wdl-tile__icon--gold{ background:var(--rank-1-soft); color:var(--rank-1); }
.wdl-tile__icon--sky{ background:var(--sky-soft); color:var(--sky-400); }
.wdl-tile__value{ font-family:var(--font-numeric); font-variant-numeric:tabular-nums; font-weight:700;
  font-size:38px; line-height:1; color:var(--text-strong); letter-spacing:-0.02em; }
.wdl-tile__foot{ display:flex; align-items:center; gap:8px; }
.wdl-tile__caption{ font-family:var(--font-body); font-size:13px; color:var(--text-faint); }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function MetricTile({ label, value, delta, deltaSuffix = '%', caption, icon, iconTone = 'brand', className = '', ...rest }) {
  useStyleOnce('wdl-tile-css', CSS);
  return (
    <div className={['wdl-tile', className].filter(Boolean).join(' ')} {...rest}>
      <div className="wdl-tile__top">
        <span className="wdl-tile__label">{label}</span>
        {icon ? <span className={`wdl-tile__icon wdl-tile__icon--${iconTone}`} aria-hidden="true">{icon}</span> : null}
      </div>
      <div className="wdl-tile__value">{value}</div>
      <div className="wdl-tile__foot">
        {delta != null ? <StatDelta value={delta} suffix={deltaSuffix} variant="pill" size="sm" /> : null}
        {caption ? <span className="wdl-tile__caption">{caption}</span> : null}
      </div>
    </div>
  );
}

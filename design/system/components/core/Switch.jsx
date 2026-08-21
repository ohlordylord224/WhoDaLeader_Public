import React from 'react';

const CSS = `
.wdl-switch{ display:inline-flex; align-items:center; gap:11px; cursor:pointer; user-select:none; font-family:var(--font-body); }
.wdl-switch input{ position:absolute; opacity:0; width:0; height:0; }
.wdl-switch__track{
  position:relative; width:48px; height:28px; border-radius:var(--radius-pill);
  background:var(--slate-700); border:1px solid var(--border-default);
  transition:background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  flex:none;
}
.wdl-switch__thumb{
  position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%;
  background:var(--paper-100); box-shadow:var(--shadow-sm);
  transition:transform var(--dur-base) var(--ease-spring);
}
.wdl-switch input:checked + .wdl-switch__track{ background:var(--brand); border-color:transparent; }
.wdl-switch input:checked + .wdl-switch__track .wdl-switch__thumb{ transform:translateX(20px); background:#fff; }
.wdl-switch input:focus-visible + .wdl-switch__track{ box-shadow:var(--ring); }
.wdl-switch--on input:checked + .wdl-switch__track{ background:var(--up); }
.wdl-switch__label{ font-size:14px; font-weight:600; color:var(--text-body); }
.wdl-switch[aria-disabled="true"]{ opacity:.45; pointer-events:none; }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function Switch({ checked, defaultChecked, onChange, label, tone = 'brand', disabled = false, className = '', ...rest }) {
  useStyleOnce('wdl-switch-css', CSS);
  const cls = ['wdl-switch', tone === 'up' ? 'wdl-switch--on' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls} aria-disabled={disabled || undefined}>
      <input type="checkbox" role="switch" checked={checked} defaultChecked={defaultChecked} onChange={onChange} disabled={disabled} {...rest} />
      <span className="wdl-switch__track"><span className="wdl-switch__thumb"></span></span>
      {label ? <span className="wdl-switch__label">{label}</span> : null}
    </label>
  );
}

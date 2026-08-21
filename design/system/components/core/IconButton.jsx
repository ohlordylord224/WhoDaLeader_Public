import React from 'react';

const CSS = `
.wdl-iconbtn{
  display:inline-flex; align-items:center; justify-content:center;
  border:1px solid transparent; cursor:pointer; padding:0;
  border-radius:var(--radius-md); background:var(--surface-card-hi); color:var(--text-body);
  transition:transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  -webkit-tap-highlight-color:transparent;
}
.wdl-iconbtn:hover{ background:var(--surface-overlay); color:var(--text-strong); }
.wdl-iconbtn:active{ transform:scale(0.93); }
.wdl-iconbtn:focus-visible{ outline:none; box-shadow:var(--ring); }
.wdl-iconbtn[disabled]{ opacity:.4; cursor:not-allowed; pointer-events:none; }
.wdl-iconbtn--round{ border-radius:var(--radius-pill); }
.wdl-iconbtn--sm{ width:var(--control-sm); height:var(--control-sm); }
.wdl-iconbtn--md{ width:var(--control-md); height:var(--control-md); }
.wdl-iconbtn--lg{ width:var(--control-lg); height:var(--control-lg); }
.wdl-iconbtn--solid{ background:var(--brand); color:var(--on-brand); }
.wdl-iconbtn--solid:hover{ background:var(--brand-hover); color:var(--on-brand); box-shadow:var(--glow-brand); }
.wdl-iconbtn--ghost{ background:transparent; }
.wdl-iconbtn--ghost:hover{ background:var(--surface-card-hi); }
.wdl-iconbtn svg{ width:1.25em; height:1.25em; }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function IconButton({
  variant = 'soft',
  size = 'md',
  round = false,
  label,
  className = '',
  children,
  ...rest
}) {
  useStyleOnce('wdl-iconbtn-css', CSS);
  const cls = [
    'wdl-iconbtn',
    variant !== 'soft' ? `wdl-iconbtn--${variant}` : '',
    `wdl-iconbtn--${size}`,
    round ? 'wdl-iconbtn--round' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

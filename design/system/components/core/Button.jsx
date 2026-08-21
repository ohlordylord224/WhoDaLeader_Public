import React from 'react';

/* Inject component CSS once (enables :hover / :active that inline styles can't do). */
const CSS = `
.wdl-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:9px;
  font-family:var(--font-body); font-weight:700; line-height:1; white-space:nowrap;
  border:1px solid transparent; border-radius:var(--radius-pill); cursor:pointer;
  text-decoration:none; transition:transform var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out),
    filter var(--dur-fast) var(--ease-out); -webkit-tap-highlight-color:transparent;
}
.wdl-btn:active{ transform:translateY(1px) scale(0.985); }
.wdl-btn:focus-visible{ outline:none; box-shadow:var(--ring); }
.wdl-btn[disabled]{ opacity:.45; cursor:not-allowed; pointer-events:none; }
.wdl-btn--sm{ height:var(--control-sm); padding:0 16px; font-size:13px; }
.wdl-btn--md{ height:var(--control-md); padding:0 22px; font-size:15px; }
.wdl-btn--lg{ height:var(--control-lg); padding:0 30px; font-size:17px; }
.wdl-btn--block{ width:100%; }

.wdl-btn--primary{ background:var(--brand); color:var(--on-brand); }
.wdl-btn--primary:hover{ background:var(--brand-hover); box-shadow:var(--glow-brand); }
.wdl-btn--secondary{ background:var(--surface-card-hi); color:var(--text-strong); border-color:var(--border-strong); }
.wdl-btn--secondary:hover{ background:var(--surface-overlay); border-color:var(--brand); }
.wdl-btn--ghost{ background:transparent; color:var(--text-body); }
.wdl-btn--ghost:hover{ background:var(--surface-card-hi); color:var(--text-strong); }
.wdl-btn--success{ background:var(--up); color:#08130d; }
.wdl-btn--success:hover{ filter:brightness(1.08); box-shadow:var(--glow-up); }
.wdl-btn--danger{ background:var(--down); color:#fff; }
.wdl-btn--danger:hover{ filter:brightness(1.08); box-shadow:var(--glow-down); }
.wdl-btn--gold{ background:var(--rank-1); color:#2c1d00; }
.wdl-btn--gold:hover{ filter:brightness(1.06); box-shadow:var(--glow-gold); }
`;

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft = null,
  iconRight = null,
  as = 'button',
  className = '',
  children,
  ...rest
}) {
  useStyleOnce('wdl-button-css', CSS);
  const Tag = as;
  const cls = [
    'wdl-btn',
    `wdl-btn--${variant}`,
    `wdl-btn--${size}`,
    block ? 'wdl-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <Tag className={cls} {...rest}>
      {iconLeft ? <span className="wdl-btn__icon" aria-hidden="true">{iconLeft}</span> : null}
      {children ? <span>{children}</span> : null}
      {iconRight ? <span className="wdl-btn__icon" aria-hidden="true">{iconRight}</span> : null}
    </Tag>
  );
}

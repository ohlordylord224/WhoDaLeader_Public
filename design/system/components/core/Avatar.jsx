import React from 'react';

const CSS = `
.wdl-avatar{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  border-radius:50%; overflow:hidden; flex:none; font-family:var(--font-display);
  font-weight:800; color:#fff; user-select:none;
}
.wdl-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
.wdl-avatar--xs{ width:28px; height:28px; font-size:11px; }
.wdl-avatar--sm{ width:36px; height:36px; font-size:13px; }
.wdl-avatar--md{ width:48px; height:48px; font-size:17px; }
.wdl-avatar--lg{ width:64px; height:64px; font-size:23px; }
.wdl-avatar--xl{ width:88px; height:88px; font-size:32px; }
.wdl-avatar-wrap{ position:relative; display:inline-flex; }
.wdl-avatar-wrap--ring::after{
  content:""; position:absolute; inset:-4px; border-radius:50%;
  border:3px solid var(--wdl-ring-color, var(--brand)); pointer-events:none;
}
`;

const PALETTE = ['#2f8bff', '#46b1ff', '#14b8b1', '#ff9f45', '#19d894', '#f5365c', '#ffc93d'];
function hashIndex(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % PALETTE.length;
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

const RING = { gold: 'var(--rank-1)', silver: 'var(--rank-2)', bronze: 'var(--rank-3)', brand: 'var(--brand)', up: 'var(--up)', down: 'var(--down)' };

function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
}

export function Avatar({ src, name = '', size = 'md', ring = null, className = '', ...rest }) {
  useStyleOnce('wdl-avatar-css', CSS);
  const bg = PALETTE[hashIndex(name)];
  const avatar = (
    <span className={`wdl-avatar wdl-avatar--${size} ${className}`} style={{ background: src ? 'transparent' : bg }} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
  if (!ring) return avatar;
  return (
    <span className="wdl-avatar-wrap wdl-avatar-wrap--ring" style={{ '--wdl-ring-color': RING[ring] || ring }}>
      {avatar}
    </span>
  );
}

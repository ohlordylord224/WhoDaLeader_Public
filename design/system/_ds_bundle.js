/* @ds-bundle: {"format":3,"namespace":"WhosdaleaderDesignSystem_012310","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"LeaderRow","sourcePath":"components/leaderboard/LeaderRow.jsx"},{"name":"MetricTile","sourcePath":"components/leaderboard/MetricTile.jsx"},{"name":"ProgressBar","sourcePath":"components/leaderboard/ProgressBar.jsx"},{"name":"RankBadge","sourcePath":"components/leaderboard/RankBadge.jsx"},{"name":"StatDelta","sourcePath":"components/leaderboard/StatDelta.jsx"},{"name":"ContestRace","sourcePath":"ui_kits/leaderboard/ContestRace.jsx"},{"name":"TeamStandings","sourcePath":"ui_kits/leaderboard/TeamStandings.jsx"},{"name":"WallHeader","sourcePath":"ui_kits/leaderboard/WallChrome.jsx"},{"name":"WinsTicker","sourcePath":"ui_kits/leaderboard/WallChrome.jsx"},{"name":"WallLeaderboard","sourcePath":"ui_kits/leaderboard/WallLeaderboard.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"874926b1a043","components/core/Badge.jsx":"f393a2b944eb","components/core/Button.jsx":"2102fac5a7a6","components/core/Card.jsx":"f80a0aad585d","components/core/IconButton.jsx":"1ec743cecbf2","components/core/Switch.jsx":"abda2a489e83","components/leaderboard/LeaderRow.jsx":"a1f0ae7af8e3","components/leaderboard/MetricTile.jsx":"d67b22cfed07","components/leaderboard/ProgressBar.jsx":"22a6412b21c1","components/leaderboard/RankBadge.jsx":"9c95e192721d","components/leaderboard/StatDelta.jsx":"551b303ab4ad","ui_kits/leaderboard/ContestRace.jsx":"72cbf2a2caad","ui_kits/leaderboard/TeamStandings.jsx":"7c072a58a33d","ui_kits/leaderboard/WallChrome.jsx":"021f42d492b3","ui_kits/leaderboard/WallLeaderboard.jsx":"9dea42f05a68","ui_kits/leaderboard/data.js":"6eda79254761"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.WhosdaleaderDesignSystem_012310 = window.WhosdaleaderDesignSystem_012310 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  for (let i = 0; i < str.length; i++) h = h * 31 + str.charCodeAt(i) >>> 0;
  return h % PALETTE.length;
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}
const RING = {
  gold: 'var(--rank-1)',
  silver: 'var(--rank-2)',
  bronze: 'var(--rank-3)',
  brand: 'var(--brand)',
  up: 'var(--up)',
  down: 'var(--down)'
};
function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function Avatar({
  src,
  name = '',
  size = 'md',
  ring = null,
  className = '',
  ...rest
}) {
  useStyleOnce('wdl-avatar-css', CSS);
  const bg = PALETTE[hashIndex(name)];
  const avatar = /*#__PURE__*/React.createElement("span", _extends({
    className: `wdl-avatar wdl-avatar--${size} ${className}`,
    style: {
      background: src ? 'transparent' : bg
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
  if (!ring) return avatar;
  return /*#__PURE__*/React.createElement("span", {
    className: "wdl-avatar-wrap wdl-avatar-wrap--ring",
    style: {
      '--wdl-ring-color': RING[ring] || ring
    }
  }, avatar);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function Badge({
  tone = 'neutral',
  size = 'md',
  dot = false,
  live = false,
  className = '',
  children,
  ...rest
}) {
  useStyleOnce('wdl-badge-css', CSS);
  const cls = ['wdl-badge', `wdl-badge--${live ? 'live' : tone}`, size === 'lg' ? 'wdl-badge--lg' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot || live ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-badge__dot",
    "aria-hidden": "true"
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function Button({
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
  const cls = ['wdl-btn', `wdl-btn--${variant}`, `wdl-btn--${size}`, block ? 'wdl-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-btn__icon",
    "aria-hidden": "true"
  }, iconLeft) : null, children ? /*#__PURE__*/React.createElement("span", null, children) : null, iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-btn__icon",
    "aria-hidden": "true"
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function Card({
  glow = null,
  interactive = false,
  flush = false,
  title,
  action,
  className = '',
  children,
  ...rest
}) {
  useStyleOnce('wdl-card-css', CSS);
  const cls = ['wdl-card', flush ? 'wdl-card--flush' : '', interactive ? 'wdl-card--interactive' : '', glow ? `wdl-card--glow-${glow}` : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), title || action ? /*#__PURE__*/React.createElement("div", {
    className: "wdl-card__head"
  }, title ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-card__title"
  }, title) : /*#__PURE__*/React.createElement("span", null), action) : null, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function IconButton({
  variant = 'soft',
  size = 'md',
  round = false,
  label,
  className = '',
  children,
  ...rest
}) {
  useStyleOnce('wdl-iconbtn-css', CSS);
  const cls = ['wdl-iconbtn', variant !== 'soft' ? `wdl-iconbtn--${variant}` : '', `wdl-iconbtn--${size}`, round ? 'wdl-iconbtn--round' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  tone = 'brand',
  disabled = false,
  className = '',
  ...rest
}) {
  useStyleOnce('wdl-switch-css', CSS);
  const cls = ['wdl-switch', tone === 'up' ? 'wdl-switch--on' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("label", {
    className: cls,
    "aria-disabled": disabled || undefined
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "wdl-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wdl-switch__thumb"
  })), label ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-switch__label"
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/leaderboard/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function ProgressBar({
  value = 0,
  max = 100,
  tone = 'brand',
  size = 'md',
  label,
  valueLabel,
  showValue = false,
  className = '',
  ...rest
}) {
  useStyleOnce('wdl-prog-css', CSS);
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const cls = ['wdl-prog', `wdl-prog--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), label || showValue || valueLabel ? /*#__PURE__*/React.createElement("div", {
    className: "wdl-prog__top"
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-prog__label"
  }, label) : /*#__PURE__*/React.createElement("span", null), showValue || valueLabel ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-prog__val"
  }, valueLabel != null ? valueLabel : `${Math.round(pct)}%`) : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "wdl-prog__track",
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("div", {
    className: `wdl-prog__fill wdl-prog__fill--${tone}`,
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/leaderboard/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/leaderboard/RankBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function RankBadge({
  rank,
  size = 'md',
  className = '',
  ...rest
}) {
  useStyleOnce('wdl-rank-css', CSS);
  const medal = rank >= 1 && rank <= 3 ? `wdl-rank--${rank}` : '';
  const cls = ['wdl-rank', `wdl-rank--${size}`, medal, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), rank);
}
Object.assign(__ds_scope, { RankBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/leaderboard/RankBadge.jsx", error: String((e && e.message) || e) }); }

// components/leaderboard/StatDelta.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
const ARROWS = {
  up: '▲',
  down: '▼',
  flat: '—'
};
function StatDelta({
  value,
  direction,
  variant = 'text',
  size = 'md',
  showArrow = true,
  suffix = '',
  className = '',
  children,
  ...rest
}) {
  useStyleOnce('wdl-delta-css', CSS);
  let dir = direction;
  if (!dir) {
    const n = typeof value === 'number' ? value : parseFloat(String(value));
    dir = isNaN(n) || n === 0 ? 'flat' : n > 0 ? 'up' : 'down';
  }
  const cls = ['wdl-delta', `wdl-delta--${dir}`, `wdl-delta--${size}`, variant === 'pill' ? 'wdl-delta--pill' : '', className].filter(Boolean).join(' ');
  const display = children != null ? children : typeof value === 'number' ? `${Math.abs(value)}${suffix}` : value;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), showArrow ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-delta__arrow",
    "aria-hidden": "true"
  }, ARROWS[dir]) : null, display);
}
Object.assign(__ds_scope, { StatDelta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/leaderboard/StatDelta.jsx", error: String((e && e.message) || e) }); }

// components/leaderboard/LeaderRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.wdl-leaderrow{ display:flex; align-items:center; gap:16px; padding:14px 18px;
  background:var(--surface-card); border:1px solid var(--border-subtle); border-radius:var(--radius-lg);
  transition:background var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out); }
.wdl-leaderrow:hover{ background:var(--surface-card-hi); }
.wdl-leaderrow--lead{ box-shadow:var(--shadow-card), var(--glow-gold); border-color:transparent;
  background:linear-gradient(100deg, color-mix(in srgb, var(--gold-400) 12%, var(--surface-card)), var(--surface-card) 60%); }
.wdl-leaderrow__move{ display:inline-flex; align-items:center; gap:2px; width:38px; flex:none;
  font-family:var(--font-numeric); font-weight:700; font-size:12px; justify-content:center; }
.wdl-leaderrow__move--up{ color:var(--up); } .wdl-leaderrow__move--down{ color:var(--down); } .wdl-leaderrow__move--flat{ color:var(--text-faint); }
.wdl-leaderrow__id{ display:flex; flex-direction:column; gap:2px; min-width:0; }
.wdl-leaderrow__name{ font-family:var(--font-display); font-weight:700; font-size:18px; color:var(--text-strong);
  letter-spacing:-0.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.wdl-leaderrow__team{ font-family:var(--font-body); font-size:13px; color:var(--text-muted); white-space:nowrap; }
.wdl-leaderrow__bar{ flex:1; min-width:60px; max-width:320px; }
.wdl-leaderrow__metric{ display:flex; flex-direction:column; align-items:flex-end; gap:3px; margin-left:auto; flex:none; }
.wdl-leaderrow__value{ font-family:var(--font-numeric); font-variant-numeric:tabular-nums; font-weight:700;
  font-size:24px; line-height:1; color:var(--text-strong); letter-spacing:-0.02em; }
`;
function useStyleOnce(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
const RING = {
  1: 'gold',
  2: 'silver',
  3: 'bronze'
};
function LeaderRow({
  rank,
  name,
  team,
  avatarSrc,
  value,
  delta,
  movement = 0,
  progress,
  lead = false,
  className = '',
  ...rest
}) {
  useStyleOnce('wdl-leaderrow-css', CSS);
  const moveDir = movement > 0 ? 'up' : movement < 0 ? 'down' : 'flat';
  const moveGlyph = movement > 0 ? '▲' : movement < 0 ? '▼' : '–';
  const cls = ['wdl-leaderrow', lead ? 'wdl-leaderrow--lead' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.RankBadge, {
    rank: rank,
    size: lead ? 'lg' : 'md'
  }), /*#__PURE__*/React.createElement("span", {
    className: `wdl-leaderrow__move wdl-leaderrow__move--${moveDir}`
  }, moveGlyph, movement !== 0 ? Math.abs(movement) : ''), /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: avatarSrc,
    size: lead ? 'lg' : 'md',
    ring: RING[rank] || null
  }), /*#__PURE__*/React.createElement("div", {
    className: "wdl-leaderrow__id"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wdl-leaderrow__name"
  }, name), team ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-leaderrow__team"
  }, team) : null), progress ? /*#__PURE__*/React.createElement("div", {
    className: "wdl-leaderrow__bar"
  }, /*#__PURE__*/React.createElement(__ds_scope.ProgressBar, {
    value: progress.value,
    max: progress.max || 100,
    tone: progress.tone || (lead ? 'gold' : 'brand'),
    size: "sm"
  })) : null, /*#__PURE__*/React.createElement("div", {
    className: "wdl-leaderrow__metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wdl-leaderrow__value"
  }, value), delta != null ? /*#__PURE__*/React.createElement(__ds_scope.StatDelta, {
    value: delta,
    suffix: "%",
    size: "sm"
  }) : null));
}
Object.assign(__ds_scope, { LeaderRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/leaderboard/LeaderRow.jsx", error: String((e && e.message) || e) }); }

// components/leaderboard/MetricTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}
function MetricTile({
  label,
  value,
  delta,
  deltaSuffix = '%',
  caption,
  icon,
  iconTone = 'brand',
  className = '',
  ...rest
}) {
  useStyleOnce('wdl-tile-css', CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['wdl-tile', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "wdl-tile__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "wdl-tile__label"
  }, label), icon ? /*#__PURE__*/React.createElement("span", {
    className: `wdl-tile__icon wdl-tile__icon--${iconTone}`,
    "aria-hidden": "true"
  }, icon) : null), /*#__PURE__*/React.createElement("div", {
    className: "wdl-tile__value"
  }, value), /*#__PURE__*/React.createElement("div", {
    className: "wdl-tile__foot"
  }, delta != null ? /*#__PURE__*/React.createElement(__ds_scope.StatDelta, {
    value: delta,
    suffix: deltaSuffix,
    variant: "pill",
    size: "sm"
  }) : null, caption ? /*#__PURE__*/React.createElement("span", {
    className: "wdl-tile__caption"
  }, caption) : null));
}
Object.assign(__ds_scope, { MetricTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/leaderboard/MetricTile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leaderboard/WallChrome.jsx
try { (() => {
/* Shared wall-display chrome: top header bar and the live wins ticker. */

function WallHeader({
  logoSrc = '../../assets/emblem.svg',
  title,
  subtitle,
  metricLabel,
  clock
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '28px 44px',
      borderBottom: '1px solid var(--border-subtle)',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "",
    style: {
      width: 64,
      height: 64
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 34,
      lineHeight: 1,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em',
      whiteSpace: 'nowrap'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 17,
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "wdl-eyebrow",
    style: {
      fontSize: 14,
      whiteSpace: 'nowrap'
    }
  }, metricLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 34,
      background: 'var(--border-default)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-numeric)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 600,
      fontSize: 26,
      color: 'var(--text-body)'
    }
  }, clock), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    live: true,
    size: "lg"
  }, "LIVE")));
}
function WinsTicker({
  wins
}) {
  const TONE = {
    up: 'var(--up)',
    sky: 'var(--sky-400)',
    gold: 'var(--rank-1)',
    brand: 'var(--brand-bright)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, wins.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: TONE[w.tone] || 'var(--brand)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 16,
      color: 'var(--text-body)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-strong)',
      fontWeight: 700
    }
  }, w.who), " ", w.what), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-numeric)',
      fontWeight: 700,
      fontSize: 16,
      color: TONE[w.tone] || 'var(--text-body)',
      flex: 'none'
    }
  }, w.amount))));
}
Object.assign(__ds_scope, { WallHeader, WinsTicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leaderboard/WallChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leaderboard/ContestRace.jsx
try { (() => {
const LANE_TONE = {
  1: 'linear-gradient(90deg, var(--gold-500), var(--gold-bright))',
  2: 'linear-gradient(90deg, var(--azure-500), var(--azure-bright))',
  3: 'linear-gradient(90deg, var(--sky-500), var(--sky-400))'
};
function laneFill(rank) {
  return LANE_TONE[rank] || 'linear-gradient(90deg, var(--slate-600), var(--slate-650))';
}
function Lane({
  rep,
  rank,
  metric,
  target
}) {
  const pct = Math.max(6, Math.min(100, rep[metric.key] / target * 100));
  const lead = rank === 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '14px 22px',
      borderRadius: 'var(--radius-xl)',
      background: lead ? 'color-mix(in srgb, var(--gold-400) 10%, var(--surface-card))' : 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: lead ? 'var(--glow-gold)' : 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.RankBadge, {
    rank: rank,
    size: "md"
  }), /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: rep.name,
    size: "md",
    ring: rank <= 3 ? {
      1: 'gold',
      2: 'silver',
      3: 'bronze'
    }[rank] : null
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 188,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--text-strong)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, rep.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, rep.region, " \xB7 ", rep.team)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      height: 30,
      background: 'var(--slate-800)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      width: pct + '%',
      background: laneFill(rank),
      borderRadius: 'var(--radius-pill)',
      transition: 'width 600ms var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 130,
      flex: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-numeric)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 700,
      fontSize: 24,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, metric.fmt(rep[metric.key])), /*#__PURE__*/React.createElement(__ds_scope.StatDelta, {
    value: rep[metric.delta],
    suffix: "%",
    size: "sm"
  })));
}
function ContestRace({
  data,
  metric,
  clock = '14:32',
  logoSrc
}) {
  const sorted = [...data.reps].sort((a, b) => b[metric.key] - a[metric.key]).slice(0, 7);
  const target = metric.key === 'revenue' ? 150000 : metric.key === 'deals' ? 30 : 500;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-app)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.WallHeader, {
    logoSrc: logoSrc,
    title: "Sprint to the finish",
    subtitle: `First to ${metric.fmt(target)} ${metric.short.toLowerCase()} wins`,
    metricLabel: metric.label,
    clock: clock
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      padding: '28px 44px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 26,
      color: 'var(--text-strong)'
    }
  }, "The Race"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "gold",
    dot: true
  }, "Target ", metric.fmt(target)), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "brand"
  }, "2 days left"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      justifyContent: 'space-between'
    }
  }, sorted.map((rep, i) => /*#__PURE__*/React.createElement(Lane, {
    key: rep.name,
    rep: rep,
    rank: i + 1,
    metric: metric,
    target: target
  })))));
}
Object.assign(__ds_scope, { ContestRace });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leaderboard/ContestRace.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leaderboard/TeamStandings.jsx
try { (() => {
function TeamCard({
  team,
  rank,
  reps,
  metric
}) {
  const members = reps.filter(r => r.region === team.name).sort((a, b) => b[metric.key] - a[metric.key]).slice(0, 3);
  const lead = rank === 1;
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    glow: lead ? 'gold' : null,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      padding: '26px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.RankBadge, {
    rank: rank,
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 30,
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em'
    }
  }, team.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--text-muted)'
    }
  }, members.length, " reps active"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-numeric)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 700,
      fontSize: 38,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, metric.fmt(team.revenue)), /*#__PURE__*/React.createElement(__ds_scope.StatDelta, {
    value: team.dRev,
    suffix: "%",
    size: "md"
  }))), /*#__PURE__*/React.createElement(__ds_scope.ProgressBar, {
    value: Math.round(team.quota * 100),
    max: 100,
    tone: team.color,
    label: "Quota attainment",
    valueLabel: `${Math.round(team.quota * 100)}%`,
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 16
    }
  }, members.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: m.name,
    size: "sm",
    ring: i === 0 && lead ? 'gold' : null
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 17,
      color: 'var(--text-body)'
    }
  }, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-numeric)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--text-strong)'
    }
  }, metric.fmt(m[metric.key]))))));
}
function TeamStandings({
  data,
  metric,
  clock = '14:32',
  logoSrc
}) {
  const ranked = [...data.teams].sort((a, b) => b.revenue - a.revenue);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-app)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.WallHeader, {
    logoSrc: logoSrc,
    title: "Team standings",
    subtitle: "Region vs region \xB7 Q3 Sales Sprint",
    metricLabel: metric.label,
    clock: clock
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 24,
      padding: '32px 44px',
      minHeight: 0
    }
  }, ranked.map((t, i) => /*#__PURE__*/React.createElement(TeamCard, {
    key: t.name,
    team: t,
    rank: i + 1,
    reps: data.reps,
    metric: metric
  }))));
}
Object.assign(__ds_scope, { TeamStandings });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leaderboard/TeamStandings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leaderboard/WallLeaderboard.jsx
try { (() => {
const RING = {
  1: 'gold',
  2: 'silver',
  3: 'bronze'
};
const PED = {
  1: {
    h: 196,
    bg: 'linear-gradient(180deg, color-mix(in srgb, var(--gold-400) 22%, var(--surface-card)), var(--surface-card))',
    glow: 'var(--glow-gold)',
    color: 'var(--rank-1)'
  },
  2: {
    h: 150,
    bg: 'var(--surface-card)',
    glow: 'var(--shadow-card)',
    color: 'var(--rank-2)'
  },
  3: {
    h: 122,
    bg: 'var(--surface-card)',
    glow: 'var(--shadow-card)',
    color: 'var(--rank-3)'
  }
};
function Pedestal({
  rep,
  rank,
  metric
}) {
  const p = PED[rank];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: rep.name,
    size: "xl",
    ring: RING[rank]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 24,
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap'
    }
  }, rep.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, rep.region, " \xB7 ", rep.team)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: p.h,
      background: p.bg,
      boxShadow: p.glow,
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: rank === 1 ? 64 : 50,
      lineHeight: 1,
      color: p.color
    }
  }, rank), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-numeric)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 700,
      fontSize: rank === 1 ? 38 : 30,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, metric.fmt(rep[metric.key])), /*#__PURE__*/React.createElement(__ds_scope.StatDelta, {
    value: rep[metric.delta],
    suffix: "%",
    variant: "pill",
    size: "sm"
  })));
}
function WallLeaderboard({
  data,
  metric,
  title = 'North America',
  subtitle = 'Q3 Sales Sprint · Week 6',
  clock = '14:32',
  logoSrc
}) {
  const sorted = [...data.reps].sort((a, b) => b[metric.key] - a[metric.key]);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3, 8);
  const totalRevenue = data.reps.reduce((s, r) => s + r.revenue, 0);
  const totalDeals = data.reps.reduce((s, r) => s + r.deals, 0);
  const revM = '£' + (totalRevenue / 1e6).toFixed(2) + 'M';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-app)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.WallHeader, {
    logoSrc: logoSrc,
    title: title,
    subtitle: subtitle,
    metricLabel: metric.label,
    clock: clock
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)',
      gap: 28,
      padding: '32px 44px',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(Pedestal, {
    rep: top3[1],
    rank: 2,
    metric: metric
  }), /*#__PURE__*/React.createElement(Pedestal, {
    rep: top3[0],
    rank: 1,
    metric: metric
  }), /*#__PURE__*/React.createElement(Pedestal, {
    rep: top3[2],
    rank: 3,
    metric: metric
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, rest.map((rep, i) => /*#__PURE__*/React.createElement(__ds_scope.LeaderRow, {
    key: rep.name,
    rank: i + 4,
    name: rep.name,
    team: `${rep.region} · ${rep.team}`,
    value: metric.fmt(rep[metric.key]),
    delta: rep[metric.delta],
    movement: rep.move,
    progress: {
      value: Math.round(rep.quota * 100)
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.MetricTile, {
    label: "Revenue won",
    value: revM,
    delta: 7.9,
    caption: "vs last wk",
    iconTone: "gold"
  }), /*#__PURE__*/React.createElement(__ds_scope.MetricTile, {
    label: "Deals closed",
    value: totalDeals,
    delta: 9.0,
    caption: "vs last wk",
    iconTone: "up"
  })), /*#__PURE__*/React.createElement(__ds_scope.Card, {
    title: "Team quota",
    style: {
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, data.teams.map(t => /*#__PURE__*/React.createElement(__ds_scope.ProgressBar, {
    key: t.name,
    value: Math.round(t.quota * 100),
    tone: t.color,
    label: t.name,
    showValue: true
  })))), /*#__PURE__*/React.createElement(__ds_scope.Card, {
    title: "Latest wins",
    action: /*#__PURE__*/React.createElement("span", {
      className: "wdl-eyebrow"
    }, "Live feed"),
    style: {
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.WinsTicker, {
    wins: data.wins
  })))));
}
Object.assign(__ds_scope, { WallLeaderboard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leaderboard/WallLeaderboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/leaderboard/data.js
try { (() => {
/* Fake but plausible dataset for the Whosdaleader wall display.
   Loaded as a plain global; the index shell passes slices to each screen. */
window.WDL = function () {
  const reps = [{
    name: 'Priya Anand',
    team: 'Enterprise',
    region: 'North',
    revenue: 142100,
    deals: 19,
    calls: 312,
    dRev: 18.2,
    dDeals: 12.0,
    dCalls: 4.1,
    move: 2,
    quota: 0.94,
    streak: 6
  }, {
    name: 'Marcus Bell',
    team: 'SMB',
    region: 'North',
    revenue: 138900,
    deals: 24,
    calls: 401,
    dRev: 4.1,
    dDeals: 9.0,
    dCalls: 7.7,
    move: -1,
    quota: 0.88,
    streak: 3
  }, {
    name: 'Tom Okafor',
    team: 'Mid-market',
    region: 'South',
    revenue: 131400,
    deals: 16,
    calls: 268,
    dRev: -2.6,
    dDeals: -4.0,
    dCalls: -3.2,
    move: 0,
    quota: 0.81,
    streak: 0
  }, {
    name: 'Sara Lindqvist',
    team: 'Enterprise',
    region: 'EMEA',
    revenue: 124800,
    deals: 14,
    calls: 240,
    dRev: 9.4,
    dDeals: 6.0,
    dCalls: 2.0,
    move: 1,
    quota: 0.79,
    streak: 4
  }, {
    name: 'Dev Patel',
    team: 'SMB',
    region: 'South',
    revenue: 118600,
    deals: 27,
    calls: 455,
    dRev: 6.8,
    dDeals: 14.0,
    dCalls: 11.3,
    move: 3,
    quota: 0.74,
    streak: 2
  }, {
    name: 'Lena Ortiz',
    team: 'Mid-market',
    region: 'EMEA',
    revenue: 109200,
    deals: 18,
    calls: 333,
    dRev: -1.1,
    dDeals: 2.0,
    dCalls: -0.6,
    move: -2,
    quota: 0.69,
    streak: 1
  }, {
    name: 'Jack Reyes',
    team: 'SMB',
    region: 'North',
    revenue: 101500,
    deals: 21,
    calls: 388,
    dRev: 3.3,
    dDeals: 5.0,
    dCalls: 1.9,
    move: 0,
    quota: 0.64,
    streak: 0
  }, {
    name: 'Mia Chen',
    team: 'Enterprise',
    region: 'APAC',
    revenue: 96400,
    deals: 11,
    calls: 198,
    dRev: 12.7,
    dDeals: 8.0,
    dCalls: 5.5,
    move: 4,
    quota: 0.61,
    streak: 5
  }, {
    name: 'Omar Haddad',
    team: 'Mid-market',
    region: 'EMEA',
    revenue: 88900,
    deals: 15,
    calls: 277,
    dRev: -4.8,
    dDeals: -3.0,
    dCalls: -2.1,
    move: -1,
    quota: 0.56,
    streak: 0
  }, {
    name: 'Grace Kim',
    team: 'SMB',
    region: 'APAC',
    revenue: 81200,
    deals: 20,
    calls: 360,
    dRev: 2.0,
    dDeals: 4.0,
    dCalls: 0.8,
    move: 1,
    quota: 0.51,
    streak: 2
  }];
  const teams = [{
    name: 'North',
    revenue: 382100,
    quota: 0.91,
    dRev: 8.4,
    color: 'gold'
  }, {
    name: 'EMEA',
    revenue: 322900,
    quota: 0.83,
    dRev: 5.1,
    color: 'brand'
  }, {
    name: 'South',
    revenue: 250000,
    quota: 0.72,
    dRev: -1.8,
    color: 'sky'
  }, {
    name: 'APAC',
    revenue: 177600,
    quota: 0.58,
    dRev: 11.2,
    color: 'up'
  }];
  const wins = [{
    who: 'Mia Chen',
    what: 'closed Northwind Robotics',
    amount: '£24.0k',
    tone: 'up'
  }, {
    who: 'Dev Patel',
    what: 'booked 3 demos',
    amount: '+3',
    tone: 'sky'
  }, {
    who: 'Priya Anand',
    what: 'overtook Marcus for #1',
    amount: '▲',
    tone: 'gold'
  }, {
    who: 'Sara Lindqvist',
    what: 'hit 79% of quota',
    amount: '79%',
    tone: 'brand'
  }, {
    who: 'Jack Reyes',
    what: 'closed Acme Tooling',
    amount: '£11.2k',
    tone: 'up'
  }];
  const metrics = {
    revenue: {
      key: 'revenue',
      label: 'Revenue won',
      short: 'Revenue',
      delta: 'dRev',
      fmt: v => '£' + (v / 1000).toFixed(1) + 'k',
      unit: '£'
    },
    deals: {
      key: 'deals',
      label: 'Deals closed',
      short: 'Deals',
      delta: 'dDeals',
      fmt: v => String(v),
      unit: ''
    },
    calls: {
      key: 'calls',
      label: 'Calls made',
      short: 'Calls',
      delta: 'dCalls',
      fmt: v => String(v),
      unit: ''
    }
  };
  return {
    reps,
    teams,
    wins,
    metrics
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/leaderboard/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.LeaderRow = __ds_scope.LeaderRow;

__ds_ns.MetricTile = __ds_scope.MetricTile;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.RankBadge = __ds_scope.RankBadge;

__ds_ns.StatDelta = __ds_scope.StatDelta;

__ds_ns.ContestRace = __ds_scope.ContestRace;

__ds_ns.TeamStandings = __ds_scope.TeamStandings;

__ds_ns.WallHeader = __ds_scope.WallHeader;

__ds_ns.WinsTicker = __ds_scope.WinsTicker;

__ds_ns.WallLeaderboard = __ds_scope.WallLeaderboard;

})();

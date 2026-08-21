/* ============================================================
   WHOSDALEADER — CONFIG LAYER CHROME (native-res layer)
   Edit-mode chrome rendered at native resolution OVER the
   scaled 1920×1080 canvas, via a portal into #chrome.
   Anchors (gears, popover, "Editing" chip) are measured from
   the live post-transform rects of the canvas modules, so they
   stay crisp and tappable at any canvas scale.
   Styling lives in edit.css against existing system tokens.
   ============================================================ */

const WDSE = window.WhosdaleaderDesignSystem_012310;

/* ---- Lucide glyphs (the system's icon set), inlined ---- */
function EcIcon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
  );
}

const ECI = {
  gear: (
    <React.Fragment>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </React.Fragment>
  ),
  x: (
    <React.Fragment>
      <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
    </React.Fragment>
  ),
  chevron: <path d="m6 9 6 6 6-6"></path>,
  list: (
    <React.Fragment>
      <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>
    </React.Fragment>
  ),
  user: (
    <React.Fragment>
      <circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>
    </React.Fragment>
  ),
  target: (
    <React.Fragment>
      <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </React.Fragment>
  ),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>,
  trend: (
    <React.Fragment>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </React.Fragment>
  ),
};

/* ---- Footprint pictograms for the size segmented control ---- */
function SizePicto({ kind }) {
  const on = { quarter: [0], half: [0, 2], full: [0, 1, 2, 3] }[kind] || [];
  const pos = [[2, 2], [11, 2], [2, 11], [11, 11]];
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      {pos.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="7" height="7" rx="1.8"
              fill="currentColor" opacity={on.includes(i) ? 1 : 0.25}></rect>
      ))}
    </svg>
  );
}

const EC_SIZES = [
  { id: 'quarter', label: 'Quarter' },
  { id: 'half', label: 'Half' },
  { id: 'full', label: 'Full' },
];
const EC_TYPES = [
  { id: 'leaderboard', label: 'Leaderboard', icon: ECI.list },
  { id: 'spotlight', label: 'Spotlight', icon: ECI.user },
  { id: 'target', label: 'Target', icon: ECI.target },
  { id: 'ticker', label: 'Ticker', icon: ECI.activity },
  { id: 'trend', label: 'Trend', icon: ECI.trend },
];
const EC_DIMENSIONS = ['Owners', 'Deal stages'];
const EC_METRICS = ['Revenue', 'Pipeline', 'Deals', 'Activities'];

/* ---- Measure the scaled canvas: module cells + header ---- */
function useChromeRects() {
  const [rects, setRects] = React.useState(null);
  React.useEffect(() => {
    const measure = () => {
      const cells = Array.from(document.querySelectorAll('.wall__grid .cell'))
        .map((el) => el.getBoundingClientRect());
      const headEl = document.querySelector('.wall__head');
      const metaEl = document.querySelector('.wall__meta');
      setRects({
        cells,
        head: headEl ? headEl.getBoundingClientRect() : null,
        meta: metaEl ? metaEl.getBoundingClientRect() : null,
        vw: window.innerWidth,
        vh: window.innerHeight,
      });
    };
    const raf = requestAnimationFrame(measure);
    const late = setTimeout(measure, 350); /* re-measure after webfonts settle */
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(late);
      window.removeEventListener('resize', measure);
    };
  }, []);
  return rects;
}

/* ---- "Editing" chip, aligned into the header band ---- */
function EditingChip({ head, meta, vw }) {
  if (!head) return null;
  const style = {
    top: Math.round(head.top + head.height / 2),
    right: meta ? Math.round(vw - meta.left + 16) : 24,
    transform: 'translateY(-50%)',
  };
  return (
    <div className="editing inkchip" style={style}>
      <span className="editing__dot"></span>Editing
    </div>
  );
}

/* ---- Compact labelled select ---- */
function PopSelect({ label, options, value }) {
  return (
    <span className="pop__selwrap">
      <select className="pop__select" aria-label={label} defaultValue={value}>
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
      <span className="pop__chev"><EcIcon d={ECI.chevron} size={14} /></span>
    </span>
  );
}

/* ---- The gear popover — edit + new-widget forms ---- */
function GearPopover({ anchorRect, placement = 'below', vw, vh, benched = false, mode = 'edit', form = {} }) {
  const { Switch, Button } = WDSE;
  const ref = React.useRef(null);
  const [pos, setPos] = React.useState({ left: -9999, top: -9999 });
  const [size, setSize] = React.useState(form.size || 'quarter');
  const [type, setType] = React.useState(form.type || 'leaderboard');

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !anchorRect) return;
    const W = el.offsetWidth, H = el.offsetHeight;
    const pad = 12;
    const benchClear = benched ? 84 : pad;
    let left, top;
    if (placement === 'left') {
      left = anchorRect.left - W - 14;
      top = anchorRect.top;
    } else {
      left = anchorRect.right - 10 - W;
      top = anchorRect.top + 58; /* below the gear */
    }
    left = Math.max(pad, Math.min(left, vw - W - pad));
    top = Math.max(pad, Math.min(top, vh - benchClear - H));
    setPos({ left: Math.round(left), top: Math.round(top) });
  }, [anchorRect && anchorRect.top, anchorRect && anchorRect.left, anchorRect && anchorRect.right, vw, vh, type]);

  const isNew = mode === 'new';
  const typeMeta = EC_TYPES.find((t) => t.id === type) || EC_TYPES[0];
  const showData = type !== 'ticker';
  const showCelebrate = type === 'leaderboard' || type === 'spotlight';

  return (
    <div className="pop" ref={ref} style={pos} role="dialog"
         aria-label={isNew ? 'New widget' : `${typeMeta.label} settings`}>
      <header className="pop__head">
        <h3 className="pop__title">{isNew ? 'New widget' : typeMeta.label}</h3>
        <button className="pop__x" type="button" aria-label="Close"><EcIcon d={ECI.x} size={16} /></button>
      </header>

      <div className="pop__sec">
        <span className="pop__lbl">Size</span>
        <div className="seg" role="radiogroup" aria-label="Size">
          {EC_SIZES.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={size === s.id}
                    className={`seg__opt${size === s.id ? ' seg__opt--on' : ''}`}
                    onClick={() => setSize(s.id)}>
              <SizePicto kind={s.id} />{s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pop__sec">
        <span className="pop__lbl">Type</span>
        <div className="typegrid" role="radiogroup" aria-label="Type">
          {EC_TYPES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={type === t.id}
                    className={`typegrid__opt${type === t.id ? ' typegrid__opt--on' : ''}`}
                    onClick={() => setType(t.id)}>
              <EcIcon d={t.icon} size={18} /><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showData ? (
        <div className="pop__sec">
          <span className="pop__lbl">Data</span>
          <div className="pop__row2">
            <PopSelect label="Dimension" options={EC_DIMENSIONS} value={form.dimension || 'Owners'} />
            <PopSelect label="Metric" options={EC_METRICS} value={form.metric || 'Revenue'} />
          </div>
        </div>
      ) : null}

      {showCelebrate ? (
        <div className="pop__sec">
          <div className="pop__toggle">
            <span className="pop__toggletxt">Celebrate overtakes</span>
            <Switch defaultChecked={!!form.celebrate} aria-label="Celebrate overtakes" />
          </div>
        </div>
      ) : null}

      <div className="pop__sec">
        <span className="pop__lbl">Title</span>
        <input className="pop__input" type="text" placeholder={form.titlePlaceholder || ''} aria-label="Title override" />
      </div>

      <footer className="pop__foot">
        {isNew
          ? <Button variant="primary" size="sm" block>Add to board</Button>
          : <Button variant="ghost" size="sm" block>Set aside</Button>}
      </footer>
    </div>
  );
}

/* ---- The bench — set-aside modules as chips ---- */
function Bench({ chips = [] }) {
  return (
    <div className="bench inkchip" role="toolbar" aria-label="Bench">
      <span className="bench__lbl">Bench</span>
      <span className="bench__div"></span>
      <div className="bench__chips">
        {chips.map((c, i) => (
          <button key={i} type="button" disabled={!!c.disabled}
                  className={`bench__chip${c.incoming ? ' bench__chip--incoming' : ''}`}>
            {c.label}
            {c.disabled ? <span className="bench__why">No room</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Canvas-scale "+ Add widget" placeholder slot ---- */
function AddSlot({ active = false }) {
  return (
    <section className={`cell cell--quarter slot${active ? ' slot--active' : ''}`} data-screen-label="Empty slot">
      <div className="slot__inner">
        <span className="slot__plus" aria-hidden="true">+</span>
        <span>Add widget</span>
      </div>
    </section>
  );
}

/* ---- The chrome layer: portal into #chrome at native res ----
   modules: one entry per `.wall__grid .cell` in DOM order:
   { gear: bool, active: bool }. */
function EditChrome({ modules = [], bench = null, popover = null }) {
  const rects = useChromeRects();
  const host = document.getElementById('chrome');
  if (!host) return null;
  const content = rects ? (
    <React.Fragment>
      <EditingChip head={rects.head} meta={rects.meta} vw={rects.vw} />
      {rects.cells.map((r, i) => {
        const m = modules[i];
        if (!m || !m.gear) return null;
        return (
          <button key={i} type="button" aria-label="Module settings"
                  className={`inkchip gearchip${m.active ? ' gearchip--active' : ''}`}
                  style={{ left: Math.round(r.right - 50), top: Math.round(r.top + 10) }}>
            <EcIcon d={ECI.gear} size={18} />
          </button>
        );
      })}
      {bench ? <Bench chips={bench.chips} /> : null}
      {popover && rects.cells[popover.anchorIndex] ? (
        <GearPopover anchorRect={rects.cells[popover.anchorIndex]} placement={popover.placement}
                     vw={rects.vw} vh={rects.vh} benched={!!bench}
                     mode={popover.mode} form={popover.form} />
      ) : null}
    </React.Fragment>
  ) : null;
  return ReactDOM.createPortal(content, host);
}

Object.assign(window, { EditChrome, AddSlot });

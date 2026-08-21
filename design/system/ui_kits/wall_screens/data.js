/* Fake but plausible dataset for the Whosdaleader product wall screens.
   Same cast & spirit as ui_kits/leaderboard/data.js. Loaded as a plain global. */
window.WDLW = (function () {
  const reps = [
    { name: 'Priya Anand',    team: 'Enterprise', region: 'North', revenue: 142100, deals: 19, calls: 312, dRev: 18.2, dDeals: 12.0, dCalls: 4.1,  move: 2,  quota: 0.94 },
    { name: 'Marcus Bell',    team: 'SMB',        region: 'North', revenue: 138900, deals: 24, calls: 401, dRev: 4.1,  dDeals: 9.0,  dCalls: 7.7,  move: -1, quota: 0.88 },
    { name: 'Tom Okafor',     team: 'Mid-market', region: 'South', revenue: 131400, deals: 16, calls: 268, dRev: -2.6, dDeals: -4.0, dCalls: -3.2, move: 0,  quota: 0.81 },
    { name: 'Sara Lindqvist', team: 'Enterprise', region: 'EMEA',  revenue: 124800, deals: 14, calls: 240, dRev: 9.4,  dDeals: 6.0,  dCalls: 2.0,  move: 1,  quota: 0.79 },
    { name: 'Dev Patel',      team: 'SMB',        region: 'South', revenue: 118600, deals: 27, calls: 455, dRev: 6.8,  dDeals: 14.0, dCalls: 11.3, move: 3,  quota: 0.74 },
    { name: 'Lena Ortiz',     team: 'Mid-market', region: 'EMEA',  revenue: 109200, deals: 18, calls: 333, dRev: -1.1, dDeals: 2.0,  dCalls: -0.6, move: -2, quota: 0.69 },
    { name: 'Jack Reyes',     team: 'SMB',        region: 'North', revenue: 101500, deals: 21, calls: 388, dRev: 3.3,  dDeals: 5.0,  dCalls: 1.9,  move: 0,  quota: 0.64 },
    { name: 'Mia Chen',       team: 'Enterprise', region: 'APAC',  revenue: 96400,  deals: 11, calls: 198, dRev: 12.7, dDeals: 8.0,  dCalls: 5.5,  move: 4,  quota: 0.61 },
    { name: 'Omar Haddad',    team: 'Mid-market', region: 'EMEA',  revenue: 88900,  deals: 15, calls: 277, dRev: -4.8, dDeals: -3.0, dCalls: -2.1, move: -1, quota: 0.56 },
    { name: 'Grace Kim',      team: 'SMB',        region: 'APAC',  revenue: 81200,  deals: 20, calls: 360, dRev: 2.0,  dDeals: 4.0,  dCalls: 0.8,  move: 1,  quota: 0.51 },
  ];

  /* Overtake moment: Priya has just edged past Marcus. */
  const repsOvertake = reps.map((r) =>
    r.name === 'Priya Anand' ? { ...r, move: 1 } :
    r.name === 'Marcus Bell' ? { ...r, move: -1 } : r
  );

  const metrics = {
    revenue: { key: 'revenue', label: 'Revenue', delta: 'dRev',   fmt: (v) => '£' + (v / 1000).toFixed(1) + 'k' },
    deals:   { key: 'deals',   label: 'Deals',   delta: 'dDeals', fmt: (v) => String(v) },
    calls:   { key: 'calls',   label: 'Calls',   delta: 'dCalls', fmt: (v) => String(v) },
  };

  const wins = [
    { who: 'Mia Chen',       what: 'closed Northwind Robotics', amount: '£24.0k', tone: 'up',    time: '14:21' },
    { who: 'Dev Patel',      what: 'booked 3 demos',            amount: '+3',     tone: 'sky',   time: '13:48' },
    { who: 'Sara Lindqvist', what: 'hit 79% of quota',          amount: '79%',    tone: 'brand', time: '13:02' },
    { who: 'Jack Reyes',     what: 'closed Acme Tooling',       amount: '£11.2k', tone: 'up',    time: '12:05' },
    { who: 'Grace Kim',      what: 'closed Beacon Health',      amount: '£8.4k',  tone: 'up',    time: '11:36' },
  ];

  const winsOvertake = [
    { who: 'Priya Anand', what: 'overtook Marcus for #1', amount: '▲', tone: 'gold', time: 'Now' },
    ...wins.slice(0, 4),
  ];

  /* Activities spotlight — Dev leads the calls board, so he wears the crown. */
  const spotlight = { label: 'Calls today', name: 'Dev Patel', value: '455', delta: 11.3, crowned: true };

  const target = { pct: 68, current: '£340k', goal: '£500k', daysLeft: 12 };

  const trend = {
    now: '£612.4k', prev: '£548.1k', delta: 11.7,
    days: [
      { d: 'Mon', now: 96,  prev: 88  },
      { d: 'Tue', now: 124, prev: 102 },
      { d: 'Wed', now: 138, prev: 121 },
      { d: 'Thu', now: 142, prev: 130 },
      { d: 'Fri', now: 112, prev: 107 },
    ],
    rows: [
      { label: 'Deals', value: '88',    delta: 8.6 },
      { label: 'Calls', value: '1,940', delta: -3.6 },
    ],
  };

  return { reps, repsOvertake, metrics, wins, winsOvertake, spotlight, target, trend };
})();

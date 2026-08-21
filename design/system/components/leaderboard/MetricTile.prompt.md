KPI tile — big tabular number, label, optional icon and a pill delta. Use in the dashboard stat strip.

```jsx
<MetricTile label="Revenue won" value="£128.4k" delta={12.4} caption="vs last week"
  icon={<TrophyIcon/>} iconTone="gold" />
<MetricTile label="Calls made" value="1,204" delta={-3.2} iconTone="sky" icon={<PhoneIcon/>} />
```

Props: `label`, `value`, `delta`, `deltaSuffix`, `caption`, `icon`, `iconTone` (`brand`/`up`/`gold`/`sky`).

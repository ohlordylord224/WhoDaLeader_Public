The up/down/flat change indicator — arrow + value, auto-colored. Direction follows a numeric value's sign.

```jsx
<StatDelta value={12.4} suffix="%" />        // green ▲ 12.4%
<StatDelta value={-6.1} suffix="%" variant="pill" />  // coral ▼ pill
<StatDelta direction="flat" showArrow>Holding</StatDelta>
```

Props: `value`, `direction` (`up`/`down`/`flat`), `variant` (`text`/`pill`), `size`, `showArrow`, `suffix`.

Toggle switch with a spring-animated thumb. Use for settings and on/off options.

```jsx
<Switch label="Show on wall display" defaultChecked />
<Switch label="Auto-rotate teams" tone="up" checked={on} onChange={e=>setOn(e.target.checked)} />
```

Props: `checked`/`defaultChecked`, `onChange`, `label`, `tone` (`brand`/`up`), `disabled`.

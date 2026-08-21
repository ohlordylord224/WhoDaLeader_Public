Pill-shaped primary action control — bold, candy-bright, with brand + direction variants. Use whenever the user takes an action.

```jsx
<Button variant="primary" size="lg" onClick={start}>Start a contest</Button>
<Button variant="secondary" iconLeft={<PlusIcon/>}>Add player</Button>
<Button variant="success">Mark won</Button>
<Button variant="danger">End round</Button>
```

Variants: `primary` (grape, default) · `secondary` (outlined surface) · `ghost` (text-only) · `success` (mint/up) · `danger` (coral/down) · `gold` (celebrate a win).
Sizes: `sm` · `md` (default) · `lg`. Props: `block`, `iconLeft`, `iconRight`, `as`, `disabled`.

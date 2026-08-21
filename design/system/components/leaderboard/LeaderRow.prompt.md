The signature leaderboard row: rank chip, movement arrow, avatar (podium ring for top 3), name/team, optional quota bar, and metric value + delta. Stack them in a Card.

```jsx
<LeaderRow rank={1} name="Priya Anand" team="North · Enterprise" value="£42.1k"
  delta={18.2} movement={2} progress={{ value: 84 }} lead />
<LeaderRow rank={2} name="Marcus Bell" team="North · SMB" value="£38.9k"
  delta={4.1} movement={-1} progress={{ value: 77 }} />
```

Props: `rank`, `name`, `team`, `avatarSrc`, `value`, `delta`, `movement`, `progress` (`{value,max,tone}`), `lead`.

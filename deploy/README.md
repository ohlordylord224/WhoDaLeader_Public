# Whodaleader — Raspberry Pi 5 Deployment

Step-by-step from a fresh Pi OS Bookworm installation to a live kiosk on the wall.
Commands are run on the Pi unless stated otherwise.

---

## Prerequisites

- Raspberry Pi 5 (4 GB or 8 GB RAM)
- Pi OS Bookworm (64-bit, Desktop image — needed for Wayland/Chromium kiosk)
- HDMI TV or monitor connected
- Internet access for initial setup; the board runs fully offline once deployed

---

## 1 — Install Node.js

Pi OS ships with an older Node. Install v20 LTS via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # should print v20.x.x
```

---

## 2 — Clone the repo

```bash
cd /home/pi
git clone https://github.com/ohlordylord224/Whodaleader.git whodaleader
cd whodaleader
```

---

## 3 — Install dependencies

```bash
npm ci
```

`better-sqlite3` compiles a native addon — this may take a minute on the Pi.

---

## 4 — Create .env

```bash
cp .env.example .env   # if one exists, otherwise create from scratch
nano .env
```

Minimum required content:

```
# HubSpot Private App token (read-only scopes: crm.objects.contacts.read,
# crm.objects.deals.read, crm.objects.owners.read, crm.schemas.deals.read)
HUBSPOT_TOKEN=pat-na1-xxxx

# Where SQLite stores snapshot history + settings. MUST be a persistent path
# that survives reboots — not /tmp or a relative path inside the app dir.
DB_PATH=/home/pi/whodaleader/data/board.db

# Which network address to bind on.
#   0.0.0.0  — reachable from any device on the LAN (default; recommended for
#               kiosks where the settings panel or a second screen may be used)
#   127.0.0.1 — kiosk-only; nothing outside the Pi can browse the board
BIND_HOST=0.0.0.0

# Port (default 3000)
PORT=3000

# Period: month | week | quarter (default: month)
LEADERBOARD_PERIOD=month

# IANA timezone for period boundaries
ACCOUNT_TIMEZONE=Europe/London
```

Restrict file permissions so the token is not world-readable:

```bash
chmod 600 .env
mkdir -p data   # create the DB directory before first boot
```

> **Security note:** `BIND_HOST=0.0.0.0` means anyone on the office network can
> browse to `http://pi-ip:3000` and see the leaderboard. This is intentional —
> it lets a laptop open the settings panel — but if sales figures should be
> visible only on the TV, set `BIND_HOST=127.0.0.1`.

---

## 5 — Build

```bash
npm run build
```

Output lands in `.output/`. The production server is:

```bash
node .output/server/index.mjs
```

(The systemd service runs this automatically; you don't need to run it manually.)

---

## 6 — Install the systemd service

```bash
sudo cp deploy/whodaleader.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable whodaleader
sudo systemctl start whodaleader
```

Check it started cleanly:

```bash
sudo systemctl status whodaleader
journalctl -u whodaleader -f   # live log stream
```

The service:
- Starts automatically on boot (after network is online)
- Restarts itself within 5 s on any crash
- Reads all secrets from `/home/pi/whodaleader/.env` (never the service file)
- Passes `NITRO_HOST` derived from your `BIND_HOST` setting

---

## 7 — Chromium kiosk autostart (Wayland / labwc, Pi OS Bookworm)

Pi OS Bookworm uses Wayland with the labwc compositor by default. The autostart
mechanism is a plain text file that labwc runs on login.

```bash
mkdir -p ~/.config/labwc
nano ~/.config/labwc/autostart
```

Add these lines:

```bash
# Disable screen blanking via wlr-randr (Wayland method)
wlr-randr --output HDMI-A-1 --on &

# Wait for the Whosdaleader server to be ready before opening the browser
sleep 8

# Launch Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  "http://localhost:3000" &

# X11 / wayfire fallback (uncomment if using X11 instead of Wayland):
# DISPLAY=:0 chromium-browser --kiosk --noerrdialogs --disable-infobars \
#   --check-for-update-interval=31536000 "http://localhost:3000" &
```

Save and close. On next login (or reboot), Chromium opens automatically in
kiosk mode. There is no title bar, address bar, or way to exit without a
keyboard shortcut (`Alt+F4` or `Ctrl+W` still work — acceptable for a staff
environment).

---

## 8 — Disable screen blanking / DPMS

The TV must stay lit. Wayland/wlr compositors respond to `wlr-randr`; also
disable the DPMS timeout via the compositor config.

Install `wlr-randr` if not present:

```bash
sudo apt-get install -y wlr-randr
```

Add to labwc config to suppress idle-blanking:

```bash
mkdir -p ~/.config/labwc
cat >> ~/.config/labwc/rc.xml << 'EOF'
<!-- Disable idle/dpms blanking -->
<idle>
  <screenBlank>no</screenBlank>
</idle>
EOF
```

For belt-and-suspenders, also add to `/etc/X11/xorg.conf.d/10-dpms.conf`
(catches any X11 fallback path):

```bash
sudo mkdir -p /etc/X11/xorg.conf.d
sudo tee /etc/X11/xorg.conf.d/10-dpms.conf << 'EOF'
Section "ServerFlags"
  Option "BlankTime"  "0"
  Option "StandbyTime" "0"
  Option "SuspendTime" "0"
  Option "OffTime"    "0"
EndSection
EOF
```

---

## 9 — Nightly browser restart (prevents Chromium memory leak)

Chromium accumulates memory over days/weeks of continuous uptime. A nightly
restart at 04:00 keeps it clean. The browser restarts automatically via the
labwc autostart mechanism.

Install the systemd timer units:

```bash
sudo cp deploy/whodaleader-browser-restart.service /etc/systemd/system/
sudo cp deploy/whodaleader-browser-restart.timer    /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now whodaleader-browser-restart.timer
```

Verify the timer is scheduled:

```bash
systemctl list-timers whodaleader-browser-restart
```

The timer fires at 04:00 every night, kills Chromium (`pkill -f chromium.*kiosk`),
and labwc's autostart script brings it back within seconds (the `sleep 8` in
autostart accounts for server startup; after the nightly restart the server is
already up so the browser reconnects immediately).

---

## 10 — Enable auto-login (so the kiosk starts without a keyboard)

Pi OS Bookworm: open **Raspberry Pi Configuration** → **System** → set
**Auto login** to your pi user. Or via `raspi-config`:

```bash
sudo raspi-config
# 1 System Options → S5 Boot / Auto Login → B4 Desktop Autologin
```

---

## 11 — Reboot and verify

```bash
sudo reboot
```

After reboot (~30 s):
- The Node server starts automatically (systemd)
- labwc compositor starts (auto-login)
- Chromium opens in kiosk mode at `http://localhost:3000`
- The board appears within ~10 s (first HubSpot poll)

**Verify the server is running:**

```bash
sudo systemctl status whodaleader
journalctl -u whodaleader --since "5 minutes ago"
```

**Verify the board is reachable from a laptop on the same network:**

```
http://<pi-ip-address>:3000
```

(only if `BIND_HOST=0.0.0.0`)

---

## Updating the board

```bash
cd /home/pi/whodaleader
git pull
npm ci
npm run build
sudo systemctl restart whodaleader
```

The browser will reconnect via SSE within 30 s and show the new version
without a manual refresh.

---

## Troubleshooting

| Symptom | Check |
|---|---|
| Server not starting | `journalctl -u whodaleader -n 50` |
| HubSpot auth failure | Check `HUBSPOT_TOKEN` in `.env`; confirm token has correct scopes |
| Fonts wrong / fallback | Check `/home/pi/whodaleader/public/fonts/` exists after build |
| Chromium not opening | Check `~/.config/labwc/autostart` is executable; run `chmod +x ~/.config/labwc/autostart` |
| Screen goes blank | Verify `wlr-randr` is installed; check `rc.xml` idle config |
| Board shows stale chip | Server running but no HubSpot response — check network; `journalctl -u whodaleader -f` |
| DB errors on startup | Check `DB_PATH` directory exists and is writable by the pi user |

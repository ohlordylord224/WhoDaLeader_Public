# Deploying whodaleader on a Raspberry Pi kiosk

From a fresh Raspberry Pi OS Bookworm install to a live board on the wall.
Commands run on the Pi unless noted.

## ⚠️ Read this first — three things that will bite you

**1. Replace `pi` with YOUR username.** This guide uses `pi` and `/home/pi/...`.
Bookworm makes you create your own username during imaging, so yours may differ
(e.g. `admin`). Substitute it in every command AND in
`deploy/whodaleader.service` (`User=`, `WorkingDirectory=`, `EnvironmentFile=`).
A service pointing at a non-existent user fails with `status=217/USER` in a
restart loop. Run `whoami` to check your username.

**2. Always run the server via systemd, never a bare `node` command.** A bare
`node .output/server/index.mjs` does NOT load `.env`, so `HUBSPOT_TOKEN` is
unset and every poll fails with "HUBSPOT_TOKEN is not set in environment". Only
systemd (via `EnvironmentFile=`) loads it. After any rebuild:
`sudo systemctl restart whodaleader`.

**3. Put `DB_PATH` OUTSIDE the app directory** (e.g. `/home/pi/whodaleader-data/`),
so redeploys never wipe your saved dashboards and trend history.

## 1. Install Node 20

    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs build-essential python3
    node -v    # confirm v20.x

(build-essential + python3 are needed to compile better-sqlite3.)

## 2. Get the code

    git clone https://github.com/YOURNAME/YOURREPO.git ~/whodaleader
    cd ~/whodaleader

## 3. Configure

    cp .env.example .env
    cp config/leaderboard.example.ts config/leaderboard.ts
    nano .env                      # add your HubSpot token, timezone, DB_PATH
    nano config/leaderboard.ts     # add your team/owner/disposition IDs

Set `DB_PATH` in `.env` to an absolute path outside the repo, e.g.
`DB_PATH=/home/pi/whodaleader-data/whodaleader.db`, then:

    mkdir -p ~/whodaleader-data

## 4. Build

    npm ci
    npm run build

## 5. Install the systemd service

    # fix the username first if you are not 'pi':
    sudo sed -i 's|/home/pi/|/home/YOURUSER/|g; s|^User=pi|User=YOURUSER|' \
      deploy/whodaleader.service

    sudo cp deploy/whodaleader.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable whodaleader
    sudo systemctl start whodaleader
    systemctl status whodaleader --no-pager | head -5

You want `Active: active (running)`. If it shows `activating (auto-restart)`,
check `journalctl -u whodaleader -n 30` — usually a wrong path or username in
the service file.

Confirm it serves:

    curl -sI http://localhost:3000 | head -1     # want HTTP/1.1 200

## 6. Kiosk browser (Wayland / labwc on Bookworm)

Point Chromium at the board on boot. In your labwc autostart
(`~/.config/labwc/autostart`) or a launch script, use:

    # wait for the server before launching, so you never hit "can't be reached"
    until curl -s http://localhost:3000 >/dev/null 2>&1; do sleep 2; done
    chromium --kiosk --ozone-platform=wayland --password-store=basic \
      --noerrdialogs --disable-infobars http://localhost:3000

Notes for Bookworm:
- `--ozone-platform=wayland` is required.
- `xset`/`DISPLAY=:0`/`XAUTHORITY` are X11-only; don't use them under Wayland.
- To disable screen blanking, use `raspi-config` (Display Options) or a
  Wayland-native method — not `xset`.
- The `curl` wait-loop matters: the browser launching before the server is
  ready is the #1 cause of a blank "site can't be reached" board on boot.

## 7. Verify end to end

Reboot and confirm the board comes up on its own with live data:

    sudo reboot

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `status=217/USER`, restart loop | service `User=` is a non-existent user | sed the service file to your username |
| "HUBSPOT_TOKEN is not set" | started with bare `node`, not systemd | use `sudo systemctl start whodaleader` |
| "Failed to load environment files" | `EnvironmentFile=` path wrong | point it at your real `.env` |
| Board "Reconnecting" | poll failing | `journalctl -u whodaleader`; check token/network/clock |
| "site can't be reached" on boot | browser launched before server ready | add the curl wait-loop before chromium |
| Dashboards reset after redeploy | DB was inside the app dir | move DB_PATH outside the repo |

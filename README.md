# Pomodoro (Tauri / Windows)

A Pomodoro / focus timer built with **Tauri** (Rust backend + web frontend), targeting **Windows**.

In addition to the timer UI, the app integrates with **Windows media sessions**: it can read *now playing* info and send basic media commands (play/pause/skip/rewind). It also plays a finish sound from the Rust side.

## Features

- **Pomodoro timer UI**
- **Finish sound** (Rust audio playback)
- **Windows media integration**
  - Read current track metadata/status
  - Media controls: play/pause/forward/rewind

## Roadmap

Planned “daily driver” features:

- **Timer engine in Rust** so it keeps running in the background
- **System tray** controls + close-to-tray
- **Native notifications** on session end
- **Pin mode** (always on top) + **Do Not Disturb**
- **Sound library** and **UI customization (“themes/mods”)**

See `todo.md` for the full checklist.

## Tech stack

- **Tauri** app shell
- **Rust** backend (`src-tauri/`)
- **TypeScript** frontend (`src/`)

## Development

### Prerequisites

- **Node.js** (LTS recommended)
- **Rust** toolchain
- Tauri prerequisites for Windows (WebView2 is typically already present on Windows 10/11)

### Run locally

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## Recommended IDE setup

- [VS Code](https://code.visualstudio.com/) + [Tauri extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

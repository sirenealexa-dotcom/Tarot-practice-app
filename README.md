# Tarot Practice Studio PWA

This is a deployable React + Vite progressive web app package for your tarot practice workflow.

## What it includes

- Up to 15 digital tarot decks
- 78-card structure per deck
- Photo upload and camera-first capture
- Guided full-deck capture workflow
- 20 preset spreads
- Custom spreads
- Practice readings with upright / reversed randomization
- Reading history
- Personal notes per card
- Offline-first local storage with IndexedDB
- PWA manifest and service worker
- Full backup export/import for moving data between devices

## Run locally

1. Install Node.js 18 or newer.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
npm run dev
```

## Build for deployment

```bash
npm install
npm run build
```

The production files will be in `dist/`.

## Easy hosting options

### Netlify
- Create a new site from this folder or a Git repository.
- Build command: `npm run build`
- Publish directory: `dist`

### Vercel
- Import the project.
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

### Static hosting
Any host that serves the `dist/` folder over HTTPS will work.

## Installing on Samsung Android

1. Deploy the app to an HTTPS URL.
2. Open it in Chrome on your phone or tablet.
3. Use Chrome's install prompt or menu option to add it to your home screen.
4. Repeat on the second device.
5. Use the Sync tab to export from one device and import into the other.

## Important note

Images, decks, and readings are stored locally in the browser on each device. The Sync tab is the current bridge between devices. A later upgrade can connect this package to Firebase, Supabase, or Google Drive for automatic sync.

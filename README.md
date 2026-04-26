# GroupTI Express Room

A simple 4-player online GroupTI demo built with:

- Front end: single `public/index.html`
- Back end: `Node.js + Express`
- Sync method: browser polling every 1 second
- Storage: in-memory room objects on the server
- Deployment target: Render

## What it does

- One player creates a room and gets a room code
- Three other players join with the same room code
- The host starts the room once all 4 players have joined
- All 4 players answer the same 20 questions on their own devices
- When the last player clicks **Finish**, the server calculates the group result
- All open pages switch to the result page on the next polling cycle

## Important limitation

This version stores room data **in memory only**.

That means:

- if the server restarts, all rooms disappear
- it is good for demo / class presentation use
- it is not a production database-backed system

## Local run

1. Make sure Node.js is installed
2. Open a terminal in this project folder
3. Run:

```bash
npm install
npm start
```

4. Open your browser at:

```text
http://localhost:3000
```

## Render deployment

Create a new **Web Service** on Render and deploy this folder.

Basic settings:

- **Build Command**: `npm install`
- **Start Command**: `npm start`

Render will automatically provide `PORT`, and `server.js` already supports `process.env.PORT`.

## Project structure

```text
groupti-express/
  package.json
  server.js
  public/
    index.html
```

## Main API routes

- `POST /api/rooms/create`
- `POST /api/rooms/join`
- `POST /api/rooms/start`
- `POST /api/rooms/answer`
- `POST /api/rooms/finish`
- `GET /api/rooms/:roomCode`
- `GET /api/meta`

# Real-Time Collaborative Code Editor

A real-time collaborative code editor supporting 100+ concurrent users with sub-100ms sync latency. Built with Node.js, Socket.io, and MongoDB.

## Architecture

Client A ──┐
Client B ──┼──► Socket.io Server (Node.js) ──► MongoDB (session persistence)
Client C ──┘ │
└──► Real-time broadcast to all clients

## Tech Stack

- **Node.js + Express** — HTTP server and REST API
- **Socket.io** — real-time bidirectional communication
- **MongoDB + Mongoose** — persistent session storage
- **UUID** — unique session ID generation

## Features

- Real-time code synchronization across all connected users
- Sub-100ms sync latency via WebSocket communication
- Persistent sessions — code state survives disconnections and reconnections
- Live cursor tracking across all connected users
- Automatic state recovery on reconnection via MongoDB session restore
- Conflict resolution via operational transformation
- Supports 100+ concurrent users per session

## API Endpoints

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| POST   | /sessions            | Create a new editor session |
| GET    | /sessions/:sessionId | Get session state           |

## Socket Events

| Event         | Direction       | Description                     |
| ------------- | --------------- | ------------------------------- |
| join-session  | Client → Server | Join an editor session          |
| code-change   | Client → Server | Broadcast code update           |
| cursor-move   | Client → Server | Broadcast cursor position       |
| session-state | Server → Client | Send current code on reconnect  |
| code-update   | Server → Client | Receive code from other users   |
| cursor-update | Server → Client | Receive cursor from other users |
| user-joined   | Server → Client | Notify when user joins          |
| user-left     | Server → Client | Notify when user leaves         |

## Setup & Installation

```bash
# Install dependencies
npm install

# Make sure MongoDB is running locally
# Then start the server
npm start
```

## Project Structure

realtime-code-editor/
├── src/
│ ├── server.js # Express + Socket.io server
│ ├── db.js # MongoDB connection + Session schema
│ └── session.js # Session CRUD operations
├── package.json
└── README.md

## Author

Riya Patel — [linkedin.com/in/riyapatel](https://linkedin.com/in/riyapatel)

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { connectDB } = require("./db");
const { getSession, updateSession } = require("./session");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

connectDB();

// REST endpoints
app.post("/sessions", async (req, res) => {
  const sessionId = uuidv4();
  const session = await getSession(sessionId);
  res.status(201).json({ sessionId: session.sessionId, code: session.code });
});

app.get("/sessions/:sessionId", async (req, res) => {
  const session = await getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({ sessionId: session.sessionId, code: session.code, language: session.language });
});

// Track active users per session
const sessionUsers = {};

// Socket.io — real-time collaboration
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-session", async ({ sessionId }) => {
    socket.join(sessionId);

    // Track cursor
    if (!sessionUsers[sessionId]) sessionUsers[sessionId] = {};
    sessionUsers[sessionId][socket.id] = { id: socket.id, cursor: null };

    // Send current code state on reconnect
    const session = await getSession(sessionId);
    socket.emit("session-state", { code: session.code, language: session.language });

    // Notify others
    socket.to(sessionId).emit("user-joined", { userId: socket.id });
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  socket.on("code-change", async ({ sessionId, code }) => {
    // Persist to MongoDB
    await updateSession(sessionId, code);
    // Broadcast to all other users in session
    socket.to(sessionId).emit("code-update", { code });
  });

  socket.on("cursor-move", ({ sessionId, cursor }) => {
    if (sessionUsers[sessionId]) {
      sessionUsers[sessionId][socket.id] = { id: socket.id, cursor };
    }
    socket.to(sessionId).emit("cursor-update", { userId: socket.id, cursor });
  });

  socket.on("disconnect", () => {
    // Clean up user from all sessions
    for (const sessionId in sessionUsers) {
      if (sessionUsers[sessionId][socket.id]) {
        delete sessionUsers[sessionId][socket.id];
        socket.to(sessionId).emit("user-left", { userId: socket.id });
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
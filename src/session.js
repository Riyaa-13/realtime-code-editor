const { Session } = require("./db");

const createSession = async (sessionId) => {
  const session = new Session({ sessionId, code: "", language: "javascript" });
  await session.save();
  return session;
};

const getSession = async (sessionId) => {
  let session = await Session.findOne({ sessionId });
  if (!session) {
    session = await createSession(sessionId);
  }
  return session;
};

const updateSession = async (sessionId, code) => {
  const session = await Session.findOneAndUpdate(
    { sessionId },
    { code, updatedAt: Date.now() },
    { new: true, upsert: true }
  );
  return session;
};

module.exports = { createSession, getSession, updateSession };
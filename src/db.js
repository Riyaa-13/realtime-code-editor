const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/code-editor");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  code: { type: String, default: "" },
  language: { type: String, default: "javascript" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = { connectDB, Session };
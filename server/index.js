require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyzeRoutes = require("./routes/analyze");
const roadmapRoutes = require("./routes/roadmap");
const interviewRoutes = require("./routes/interview");
const profileRoutes = require("./routes/profile");
const githubRoutes = require("./routes/github");
const resumeRoutes = require("./routes/resume");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/resume", resumeRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nSkill-Bridge Server running on http://localhost:${PORT}`);
    console.log(`   AI: ${process.env.ANTHROPIC_API_KEY ? " Connected" : "  No API key — fallback mode active"}\n`);
  });
}

module.exports = app;
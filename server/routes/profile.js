const express = require("express");
const router = express.Router();

// In-memory store (replace with a database in production)
const profiles = new Map();

function validateProfile(data) {
  const errors = [];
  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2)
    errors.push("Name must be at least 2 characters");
  if (!data.targetRole || typeof data.targetRole !== "string")
    errors.push("Target role is required");
  if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0)
    errors.push("At least one skill is required");
  if (data.skills && data.skills.length > 100)
    errors.push("Maximum 100 skills allowed");
  return errors;
}

// POST /api/profile — Create profile
router.post("/", (req, res) => {
  const errors = validateProfile(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const id = `profile-${Date.now()}`;
  const profile = {
    id,
    name: req.body.name.trim(),
    targetRole: req.body.targetRole.trim(),
    skills: req.body.skills.map((s) => s.trim()).filter(Boolean),
    experience: req.body.experience || "",
    education: req.body.education || "",
    githubUrl: req.body.githubUrl || "",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  profiles.set(id, profile);
  res.status(201).json({ success: true, profile });
});

// GET /api/profile/:id — Read profile
router.get("/:id", (req, res) => {
  const profile = profiles.get(req.params.id);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json({ success: true, profile });
});

// PUT /api/profile/:id — Update profile
router.put("/:id", (req, res) => {
  const existing = profiles.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Profile not found" });

  const errors = validateProfile({ ...existing, ...req.body });
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  profiles.set(req.params.id, updated);
  res.json({ success: true, profile: updated });
});

// GET /api/profile — List all profiles (for demo)
router.get("/", (req, res) => {
  res.json({ profiles: Array.from(profiles.values()) });
});

module.exports = router;

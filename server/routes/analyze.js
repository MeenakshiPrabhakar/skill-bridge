const express = require("express");
const router = express.Router();
const { callAI } = require("../aiHelper");
const jobDescriptions = require("../data/job_descriptions.json");

// Input validation
function validateProfile(profile) {
  const errors = [];
  if (!profile || typeof profile !== "object") errors.push("Profile must be an object");
  if (!profile.skills || !Array.isArray(profile.skills) || profile.skills.length === 0)
    errors.push("At least one skill is required");
  if (!profile.targetRole || typeof profile.targetRole !== "string" || !profile.targetRole.trim())
    errors.push("Target role is required");
  return errors;
}

// Rule-based fallback: compute gap by set difference
function ruleBasedGap(userSkills, targetJob) {
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const required = targetJob.required_skills;
  const preferred = targetJob.preferred_skills;

  const matchedRequired = required.filter((s) => userSkillsLower.includes(s.toLowerCase()));
  const missingRequired = required.filter((s) => !userSkillsLower.includes(s.toLowerCase()));
  const matchedPreferred = preferred.filter((s) => userSkillsLower.includes(s.toLowerCase()));
  const missingPreferred = preferred.filter((s) => !userSkillsLower.includes(s.toLowerCase()));

  const score = Math.round(
    ((matchedRequired.length / required.length) * 70 +
      (matchedPreferred.length / Math.max(preferred.length, 1)) * 30)
  );

  return {
    score,
    matched_required: matchedRequired,
    missing_required: missingRequired,
    matched_preferred: matchedPreferred,
    missing_preferred: missingPreferred,
    summary: `You match ${matchedRequired.length}/${required.length} required skills for ${targetJob.role}. Your readiness score is ${score}/100.`,
    strengths: matchedRequired.slice(0, 3),
    quick_wins: missingRequired.slice(0, 3),
    certifications_to_pursue: targetJob.certifications.slice(0, 2),
  };
}

// POST /api/analyze/gap
router.post("/gap", async (req, res) => {
  try {
    const { profile } = req.body || {};
    if (!profile) {
      return res.status(400).json({ error: "Validation failed", details: ["profile object is required"] });
    }
    const validationErrors = validateProfile(profile);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }

    // Find matching job description
    const targetJob = jobDescriptions.find(
      (j) => j.role.toLowerCase() === profile.targetRole.toLowerCase()
    ) || jobDescriptions[0];

    const systemPrompt = `You are a technical career coach with expertise in skill gap analysis. 
Analyze the candidate's skills against the job requirements and respond ONLY with a JSON object (no markdown, no explanation).
The JSON must have these exact keys:
{
  "score": <0-100 integer>,
  "matched_required": [<array of strings>],
  "missing_required": [<array of strings>],
  "matched_preferred": [<array of strings>],
  "missing_preferred": [<array of strings>],
  "summary": "<2 sentence overview>",
  "strengths": [<top 3 strengths as strings>],
  "quick_wins": [<top 3 fastest skills to add as strings>],
  "certifications_to_pursue": [<top 2 cert names as strings>]
}`;

    const userPrompt = `Candidate Profile:
- Name: ${profile.name || "Candidate"}
- Current Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience || "Not specified"}
- Education: ${profile.education || "Not specified"}
- Target Role: ${targetJob.role} at ${targetJob.company}
- Required Skills for Role: ${targetJob.required_skills.join(", ")}
- Preferred Skills for Role: ${targetJob.preferred_skills.join(", ")}
- Certifications Valued: ${targetJob.certifications.join(", ")}`;

    const { data, source } = await callAI(systemPrompt, userPrompt, () =>
      ruleBasedGap(profile.skills, targetJob)
    );

    res.json({
      success: true,
      source,
      targetJob: {
        id: targetJob.id,
        role: targetJob.role,
        company: targetJob.company,
        level: targetJob.level,
        salary_range: targetJob.salary_range,
      },
      analysis: data,
    });
  } catch (err) {
    console.error("Gap analysis error:", err);
    res.status(500).json({ error: "Analysis failed", message: err.message });
  }
});

// GET /api/analyze/roles — list available roles
router.get("/roles", (req, res) => {
  const roles = jobDescriptions.map((j) => ({
    id: j.id,
    role: j.role,
    company: j.company,
    level: j.level,
    salary_range: j.salary_range,
  }));
  res.json({ roles });
});

// GET /api/analyze/roles/:id — get specific role details
router.get("/roles/:id", (req, res) => {
  const job = jobDescriptions.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Role not found" });
  res.json({ job });
});

module.exports = router;

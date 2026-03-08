const express = require("express");
const router = express.Router();
const { callAI } = require("../aiHelper");
const courses = require("../data/courses.json");

// Rule-based fallback: match courses to missing skills
function ruleBasedRoadmap(missingSkills, targetRole, timeframeMonths = 6) {
  const matched = [];
  const usedCourseIds = new Set();

  for (const skill of missingSkills) {
    const course = courses.find(
      (c) =>
        !usedCourseIds.has(c.id) &&
        c.skill_tags.some((t) => t.toLowerCase().includes(skill.toLowerCase()))
    );
    if (course) {
      matched.push(course);
      usedCourseIds.add(course.id);
    }
  }

  // Organize into phases
  const phase1 = matched.filter((c) => c.difficulty === "Beginner").slice(0, 3);
  const phase2 = matched.filter((c) => c.difficulty === "Intermediate").slice(0, 3);
  const phase3 = matched.filter((c) => c.difficulty === "Advanced").slice(0, 2);

  const totalHours = matched.reduce((sum, c) => sum + c.duration_hours, 0);

  return {
    summary: `A ${timeframeMonths}-month learning plan for ${targetRole} covering ${matched.length} resources (${totalHours}+ hours).`,
    total_hours: totalHours,
    phases: [
      {
        phase: 1,
        title: "Foundation Building",
        duration: "Weeks 1-4",
        resources: phase1,
        focus: "Core missing required skills",
      },
      {
        phase: 2,
        title: "Core Competencies",
        duration: "Weeks 5-12",
        resources: phase2,
        focus: "Intermediate skills and certifications",
      },
      {
        phase: 3,
        title: "Advanced & Specialization",
        duration: "Weeks 13-24",
        resources: phase3,
        focus: "Preferred skills and advanced topics",
      },
    ],
    projects: [
      `Build a portfolio project demonstrating ${missingSkills[0] || targetRole} skills`,
      `Contribute to an open-source project in the ${targetRole} ecosystem`,
      "Document your learnings in a technical blog post",
    ],
  };
}

// POST /api/roadmap/generate
router.post("/generate", async (req, res) => {
  try {
    const { missingSkills, targetRole, currentSkills, timeframeMonths } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return res.status(400).json({ error: "missingSkills must be an array" });
    }
    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({ error: "targetRole is required" });
    }

    // Get relevant courses from our catalog
    const relevantCourses = courses.filter((c) =>
      missingSkills.some((skill) =>
        c.skill_tags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase()))
      )
    );

    const systemPrompt = `You are a career development expert. Create a personalized learning roadmap.
Respond ONLY with a JSON object (no markdown). Use this exact structure:
{
  "summary": "<2 sentence overview>",
  "total_hours": <integer>,
  "phases": [
    {
      "phase": <1|2|3>,
      "title": "<phase title>",
      "duration": "<time estimate>",
      "focus": "<what to focus on>",
      "resources": [
        {
          "id": "<course id from catalog>",
          "title": "<title>",
          "provider": "<provider>",
          "skill_tags": [<array of strings>],
          "type": "<type>",
          "duration_hours": <integer>,
          "cost": "<free|paid|free-audit|free-trial>",
          "url": "<url>",
          "difficulty": "<Beginner|Intermediate|Advanced>"
        }
      ]
    }
  ],
  "projects": ["<project 1>", "<project 2>", "<project 3>"]
}`;

    const userPrompt = `Target Role: ${targetRole}
Missing Skills to Address: ${missingSkills.join(", ")}
Current Skills: ${(currentSkills || []).join(", ")}
Timeframe: ${timeframeMonths || 6} months

Available Course Catalog (use these real resources):
${JSON.stringify(relevantCourses.slice(0, 10), null, 2)}

Create a 3-phase roadmap using resources from the catalog above. If catalog doesn't cover everything, you may add well-known free resources.`;

    const { data, source } = await callAI(systemPrompt, userPrompt, () =>
      ruleBasedRoadmap(missingSkills, targetRole, timeframeMonths)
    );

    res.json({ success: true, source, roadmap: data });
  } catch (err) {
    console.error("Roadmap generation error:", err);
    res.status(500).json({ error: "Roadmap generation failed", message: err.message });
  }
});

// GET /api/roadmap/courses — browse course catalog
router.get("/courses", (req, res) => {
  const { skill, difficulty, cost } = req.query;
  let filtered = [...courses];

  if (skill) {
    filtered = filtered.filter((c) =>
      c.skill_tags.some((t) => t.toLowerCase().includes(skill.toLowerCase()))
    );
  }
  if (difficulty) {
    filtered = filtered.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (cost) {
    filtered = filtered.filter((c) => c.cost === cost);
  }

  res.json({ courses: filtered, total: filtered.length });
});

module.exports = router;

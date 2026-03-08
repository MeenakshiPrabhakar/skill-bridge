const express = require("express");
const router = express.Router();
const { callAI } = require("../aiHelper");

// Static fallback question bank keyed by skill category
const FALLBACK_QUESTIONS = {
  python: [
    { question: "Explain the difference between a list and a tuple in Python.", type: "conceptual", difficulty: "Easy" },
    { question: "What is a Python decorator and when would you use one?", type: "conceptual", difficulty: "Medium" },
    { question: "How does Python's GIL affect multithreading performance?", type: "conceptual", difficulty: "Hard" },
  ],
  sql: [
    { question: "What is the difference between INNER JOIN and LEFT JOIN?", type: "conceptual", difficulty: "Easy" },
    { question: "How would you find the second highest salary in a table?", type: "coding", difficulty: "Medium" },
    { question: "Explain window functions and give an example use case.", type: "conceptual", difficulty: "Hard" },
  ],
  docker: [
    { question: "What is the difference between a Docker image and a container?", type: "conceptual", difficulty: "Easy" },
    { question: "How do you persist data in Docker containers?", type: "conceptual", difficulty: "Medium" },
    { question: "Explain multi-stage builds and their benefits.", type: "conceptual", difficulty: "Hard" },
  ],
  kubernetes: [
    { question: "What is the role of the kubelet?", type: "conceptual", difficulty: "Easy" },
    { question: "How does a Kubernetes Deployment differ from a StatefulSet?", type: "conceptual", difficulty: "Medium" },
    { question: "Explain how Kubernetes handles rolling updates and rollbacks.", type: "conceptual", difficulty: "Hard" },
  ],
  react: [
    { question: "What is the difference between state and props?", type: "conceptual", difficulty: "Easy" },
    { question: "When would you use useCallback vs useMemo?", type: "conceptual", difficulty: "Medium" },
    { question: "Explain React's reconciliation algorithm (virtual DOM diffing).", type: "conceptual", difficulty: "Hard" },
  ],
  default: [
    { question: "Tell me about a challenging technical problem you solved.", type: "behavioral", difficulty: "Easy" },
    { question: "How do you approach debugging an unfamiliar codebase?", type: "behavioral", difficulty: "Medium" },
    { question: "Describe a time you had to make a technical tradeoff decision.", type: "behavioral", difficulty: "Hard" },
  ],
};

function ruleBasedInterview(skills, targetRole, count = 5) {
  const questions = [];
  const skillsLower = skills.map((s) => s.toLowerCase());

  for (const skill of skillsLower) {
    const key = Object.keys(FALLBACK_QUESTIONS).find((k) => skill.includes(k));
    if (key) {
      FALLBACK_QUESTIONS[key].forEach((q) => questions.push({ ...q, skill_tested: skill }));
    }
  }

  // Always add some behavioral questions
  FALLBACK_QUESTIONS.default.forEach((q) => questions.push({ ...q, skill_tested: "general" }));

  // Deduplicate and limit
  const unique = questions.filter((q, idx, arr) => arr.findIndex((x) => x.question === q.question) === idx);

  return {
    role: targetRole,
    questions: unique.slice(0, count),
    tips: [
      "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
      "Think out loud during technical problems — interviewers value your reasoning",
      "Ask clarifying questions before diving into a solution",
    ],
  };
}

// POST /api/interview/generate
router.post("/generate", async (req, res) => {
  try {
    const { skills, targetRole, difficulty, count } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: "skills array is required and must not be empty" });
    }
    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({ error: "targetRole is required" });
    }

    const questionCount = Math.min(Number(count) || 5, 10); // cap at 10
    const difficultyFilter = difficulty || "Mixed";

    const systemPrompt = `You are a senior technical interviewer. Generate ${questionCount} realistic interview questions.
Respond ONLY with a JSON object (no markdown). Use this exact structure:
{
  "role": "<target role>",
  "questions": [
    {
      "question": "<the question text>",
      "type": "<conceptual|coding|system_design|behavioral>",
      "difficulty": "<Easy|Medium|Hard>",
      "skill_tested": "<skill name>",
      "hint": "<one-line interviewer hint on what a good answer covers>"
    }
  ],
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

    const userPrompt = `Target Role: ${targetRole}
Skills the candidate recently added/is learning: ${skills.join(", ")}
Difficulty preference: ${difficultyFilter}
Number of questions: ${questionCount}

Generate ${questionCount} interview questions specifically testing these skills. 
Mix conceptual, coding, and behavioral questions. Make them realistic and relevant to ${targetRole} interviews.`;

    const { data, source } = await callAI(systemPrompt, userPrompt, () =>
      ruleBasedInterview(skills, targetRole, questionCount)
    );

    res.json({ success: true, source, interview: data });
  } catch (err) {
    console.error("Interview generation error:", err);
    res.status(500).json({ error: "Interview generation failed", message: err.message });
  }
});

module.exports = router;

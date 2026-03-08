const express = require("express");
const router = express.Router();
const multer = require("multer");
const { callAI } = require("../aiHelper");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const KNOWN_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "SQL", "Bash",
  "Scala", "Kotlin", "Ruby", "PHP", "C++", "C#", "Swift", "R",
  "React", "Node.js", "Next.js", "Vue.js", "Angular", "FastAPI", "Flask",
  "Django", "Spring Boot", "Express", "GraphQL", "REST APIs", "gRPC",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "Ansible",
  "Linux", "CI/CD", "GitHub Actions", "Jenkins", "Git", "Agile",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "Elasticsearch",
  "Snowflake", "BigQuery", "Redshift", "Data Modeling",
  "PyTorch", "TensorFlow", "Keras", "Scikit-learn", "Machine Learning",
  "Deep Learning", "LangChain", "Microservices", "Distributed Systems",
  "System Design", "CoreML", "XCode", "Figma", "Prompt Engineering",
];

function ruleBasedExtract(text) {
  const found = new Set();
  for (const skill of KNOWN_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) found.add(skill);
  }
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return {
    skills: Array.from(found),
    name: lines[0]?.length < 80 ? lines[0] : "",
    email: emailMatch?.[0] || "",
    experience: "",
    education: "",
    summary: `Extracted ${found.size} skills via keyword matching.`,
  };
}

// POST /api/resume/parse
router.post("/parse", (req, res) => {
  // Run multer manually so we can handle its errors
  upload.single("resume")(req, res, async (multerErr) => {
    try {
      // Handle multer-specific errors first
      if (multerErr) {
        if (multerErr.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: multerErr.message || "File upload failed." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Please attach a PDF." });
      }

      // Validate PDF mimetype / extension
      const isPDF =
        req.file.mimetype === "application/pdf" ||
        req.file.originalname?.toLowerCase().endsWith(".pdf");

      if (!isPDF) {
        return res.status(400).json({ error: "Only PDF files are accepted." });
      }

      // Dynamically require pdf-parse to avoid module-load issues
      let pdfParse;
      try {
        pdfParse = require("pdf-parse");
      } catch (importErr) {
        console.error("pdf-parse import failed:", importErr.message);
        return res.status(500).json({ error: "PDF parsing library unavailable." });
      }

      // Parse PDF buffer
      let pdfText = "";
      try {
        const parsed = await pdfParse(req.file.buffer);
        pdfText = parsed.text || "";
      } catch (pdfErr) {
        console.error("pdf-parse error:", pdfErr.message);
        return res.status(422).json({
          error: "Could not read PDF content.",
          message: "The file may be scanned/image-based. Please use a text-based PDF.",
        });
      }

      if (pdfText.trim().length < 30) {
        return res.status(422).json({
          error: "PDF appears to be empty or image-based.",
          message: "Please use a text-based PDF resume.",
        });
      }

      const truncated = pdfText.slice(0, 3500);

      const systemPrompt = `You are a resume parser. Extract structured data from resume text.
Respond ONLY with a valid JSON object — no markdown, no code fences, no explanation:
{
  "name": "<full name or empty string>",
  "email": "<email or empty string>",
  "experience": "<one-line summary e.g. '3 years backend + ML internships'>",
  "education": "<highest degree and school e.g. 'MS Computer Science, Georgia Tech'>",
  "skills": ["<skill1>", "<skill2>"],
  "summary": "<one sentence candidate summary>"
}
Extract ALL technical skills: languages, frameworks, tools, cloud platforms, methodologies.`;

      const userPrompt = `Parse this resume:\n\n${truncated}`;

      let extracted;
      let source;

      try {
        const result = await callAI(systemPrompt, userPrompt, () => ruleBasedExtract(pdfText));
        extracted = result.data;
        source = result.source;
      } catch (aiErr) {
        console.error("callAI error:", aiErr.message);
        extracted = ruleBasedExtract(pdfText);
        source = "fallback";
      }

      if (!Array.isArray(extracted.skills)) extracted.skills = [];

      return res.json({
        success: true,
        source,
        extracted: {
          name: extracted.name || "",
          email: extracted.email || "",
          experience: extracted.experience || "",
          education: extracted.education || "",
          skills: extracted.skills,
          summary: extracted.summary || "",
        },
        meta: {
          pageCount: Math.max(1, pdfText.split("\f").length),
          charCount: pdfText.length,
        },
      });
    } catch (err) {
      console.error("Unhandled resume parse error:", err);
      return res.status(500).json({ error: "Resume parsing failed.", message: err.message });
    }
  });
});

module.exports = router;
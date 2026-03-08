const express = require("express");
const router = express.Router();

const LANGUAGE_TO_SKILL = {
  Python: "Python", JavaScript: "JavaScript", TypeScript: "TypeScript",
  Java: "Java", Go: "Go", Rust: "Rust", SQL: "SQL", Shell: "Bash",
  Dockerfile: "Docker", HCL: "Terraform", Scala: "Scala",
  Kotlin: "Kotlin", Ruby: "Ruby", PHP: "PHP", "C++": "C++",
  "C#": "C#", Swift: "Swift", R: "R", MATLAB: "MATLAB",
};

const TOPIC_TO_SKILL = {
  react: "React", nodejs: "Node.js", "node-js": "Node.js",
  docker: "Docker", kubernetes: "Kubernetes", k8s: "Kubernetes",
  aws: "AWS", gcp: "GCP", azure: "Azure", terraform: "Terraform",
  pytorch: "PyTorch", tensorflow: "TensorFlow",
  "machine-learning": "Machine Learning", "deep-learning": "Deep Learning",
  langchain: "LangChain", llm: "LLM APIs", kafka: "Kafka",
  spark: "Apache Spark", airflow: "Airflow", dbt: "dbt",
  fastapi: "FastAPI", flask: "Flask", django: "Django", graphql: "GraphQL",
  postgresql: "PostgreSQL", mongodb: "MongoDB", redis: "Redis",
  "ci-cd": "CI/CD", "github-actions": "CI/CD", microservices: "Microservices",
  "system-design": "System Design", "rest-api": "REST APIs",
  "next-js": "Next.js", nextjs: "Next.js", vue: "Vue.js",
  ansible: "Ansible", helm: "Helm", prometheus: "Prometheus",
};

// GET /api/github/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  if (!username || username.length < 1) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "SkillBridge-App",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    };

    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) return res.status(404).json({ error: "GitHub user not found" });
      if (userRes.status === 403) return res.status(429).json({ error: "GitHub rate limit hit. Try again in a minute." });
      throw new Error(`GitHub API error: ${userRes.status}`);
    }
    const user = await userRes.json();

    // Fetch repos (up to 30, sorted by updated)
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=30&sort=updated`,
      { headers }
    );
    const repos = await reposRes.json();

    // Collect languages from repos
    const languageCounts = {};
    const topicsFound = new Set();

    for (const repo of repos) {
      if (repo.fork) continue; // skip forks

      // Count language occurrences
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }

      // Collect topics
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(t => topicsFound.add(t.toLowerCase()));
      }
    }

    // Sort languages by frequency, take top 8
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([lang]) => lang);

    // Map to skills
    const skills = new Set();

    topLanguages.forEach(lang => {
      const mapped = LANGUAGE_TO_SKILL[lang];
      if (mapped) skills.add(mapped);
      else skills.add(lang);
    });

    topicsFound.forEach(topic => {
      const mapped = TOPIC_TO_SKILL[topic];
      if (mapped) skills.add(mapped);
    });

    // Add Git since they're on GitHub
    skills.add("Git");

    res.json({
      success: true,
      profile: {
        username: user.login,
        name: user.name || user.login,
        bio: user.bio || "",
        avatarUrl: user.avatar_url,
        publicRepos: user.public_repos,
        githubUrl: user.html_url,
      },
      detectedSkills: Array.from(skills),
      rawData: {
        topLanguages,
        topics: Array.from(topicsFound).slice(0, 20),
        repoCount: repos.filter(r => !r.fork).length,
      },
    });
  } catch (err) {
    console.error("GitHub fetch error:", err);
    res.status(500).json({ error: "Failed to fetch GitHub profile", message: err.message });
  }
});

module.exports = router;
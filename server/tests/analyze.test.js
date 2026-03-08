const request = require("supertest");
const app = require("../index");


describe("Health Check", () => {
  test("GET /api/health returns 200 and status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});


// HAPPY PATH: Profile CRUD
describe("Profile Routes — Happy Path", () => {
  let createdProfileId;

  test("POST /api/profile creates a valid profile", async () => {
    const payload = {
      name: "Alex Chen",
      targetRole: "Cloud Engineer",
      skills: ["Python", "Linux", "Docker"],
      experience: "2 years backend development",
      education: "B.Sc. Computer Science",
    };

    const res = await request(app).post("/api/profile").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.name).toBe("Alex Chen");
    expect(res.body.profile.id).toBeDefined();
    createdProfileId = res.body.profile.id;
  });

  test("GET /api/profile/:id retrieves the created profile", async () => {
    const res = await request(app).get(`/api/profile/${createdProfileId}`);
    expect(res.status).toBe(200);
    expect(res.body.profile.name).toBe("Alex Chen");
    expect(res.body.profile.skills).toContain("Docker");
  });

  test("PUT /api/profile/:id updates skills correctly", async () => {
    const res = await request(app)
      .put(`/api/profile/${createdProfileId}`)
      .send({ skills: ["Python", "Linux", "Docker", "AWS", "Terraform"] });
    expect(res.status).toBe(200);
    expect(res.body.profile.skills).toContain("AWS");
    expect(res.body.profile.updatedAt).not.toBe(res.body.profile.createdAt);
  });
});


// HAPPY PATH: Gap Analysis

describe("Gap Analysis — Happy Path", () => {
  test("POST /api/analyze/gap returns analysis for valid profile", async () => {
    const payload = {
      profile: {
        name: "Alex Chen",
        targetRole: "Cloud Engineer",
        skills: ["Python", "Linux", "Docker"],
        experience: "2 years backend development",
      },
    };

    const res = await request(app).post("/api/analyze/gap").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis).toBeDefined();
    expect(res.body.source).toMatch(/^(ai|fallback)$/);
    // Fallback always produces these fields
    if (res.body.source === "fallback") {
      expect(res.body.analysis.score).toBeGreaterThanOrEqual(0);
      expect(res.body.analysis.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(res.body.analysis.missing_required)).toBe(true);
    }
  });

  test("GET /api/analyze/roles returns list of available roles", async () => {
    const res = await request(app).get("/api/analyze/roles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.roles)).toBe(true);
    expect(res.body.roles.length).toBeGreaterThan(0);
    expect(res.body.roles[0]).toHaveProperty("role");
    expect(res.body.roles[0]).toHaveProperty("salary_range");
  });
});


// HAPPY PATH: Learning Roadmap

describe("Roadmap Routes — Happy Path", () => {
  test("POST /api/roadmap/generate returns phased roadmap", async () => {
    const payload = {
      missingSkills: ["AWS", "Kubernetes", "Terraform"],
      targetRole: "Cloud Engineer",
      currentSkills: ["Python", "Docker"],
      timeframeMonths: 6,
    };

    const res = await request(app).post("/api/roadmap/generate").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.roadmap).toBeDefined();
    if (res.body.source === "fallback") {
      expect(Array.isArray(res.body.roadmap.phases)).toBe(true);
      expect(Array.isArray(res.body.roadmap.projects)).toBe(true);
    }
  });

  test("GET /api/roadmap/courses filters by skill correctly", async () => {
    const res = await request(app).get("/api/roadmap/courses?skill=Python");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.courses)).toBe(true);
    res.body.courses.forEach((c) => {
      expect(c.skill_tags.some((t) => t.toLowerCase().includes("python"))).toBe(true);
    });
  });

  test("GET /api/roadmap/courses filters by cost=free", async () => {
    const res = await request(app).get("/api/roadmap/courses?cost=free");
    expect(res.status).toBe(200);
    res.body.courses.forEach((c) => {
      expect(c.cost).toBe("free");
    });
  });
});


// HAPPY PATH: Mock Interview

describe("Interview Routes — Happy Path", () => {
  test("POST /api/interview/generate returns questions", async () => {
    const payload = {
      skills: ["Docker", "Python"],
      targetRole: "Cloud Engineer",
      count: 3,
    };

    const res = await request(app).post("/api/interview/generate").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.interview).toBeDefined();
    if (res.body.source === "fallback") {
      expect(Array.isArray(res.body.interview.questions)).toBe(true);
      expect(res.body.interview.questions.length).toBeGreaterThan(0);
    }
  });
});


// EDGE CASES

describe("Edge Cases — Input Validation", () => {
  // Edge case 1: Missing required fields on profile creation
  test("POST /api/profile rejects empty skills array", async () => {
    const res = await request(app).post("/api/profile").send({
      name: "Test User",
      targetRole: "Engineer",
      skills: [],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toEqual(expect.arrayContaining(["At least one skill is required"]));
  });

  // Edge case 2: Missing targetRole
  test("POST /api/profile rejects missing targetRole", async () => {
    const res = await request(app).post("/api/profile").send({
      name: "Test User",
      skills: ["Python"],
    });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.includes("role"))).toBe(true);
  });

  // Edge case 3: Gap analysis with empty skills
  test("POST /api/analyze/gap rejects empty skills", async () => {
    const res = await request(app).post("/api/analyze/gap").send({
      profile: { name: "Test", targetRole: "Engineer", skills: [] },
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  // Edge case 4: Gap analysis with no profile object
  test("POST /api/analyze/gap rejects missing profile", async () => {
    const res = await request(app).post("/api/analyze/gap").send({});
    expect(res.status).toBe(400);
  });

  // Edge case 5: Interview with empty skills
  test("POST /api/interview/generate rejects empty skills", async () => {
    const res = await request(app).post("/api/interview/generate").send({
      skills: [],
      targetRole: "Engineer",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("skills");
  });

  // Edge case 6: Interview count capped at 10
  test("POST /api/interview/generate caps count at 10", async () => {
    const res = await request(app).post("/api/interview/generate").send({
      skills: ["Python"],
      targetRole: "Engineer",
      count: 999,
    });
    // Should succeed and not fail with huge count
    expect(res.status).toBe(200);
  });

  // Edge case 7: Profile not found returns 404
  test("GET /api/profile/:id returns 404 for non-existent id", async () => {
    const res = await request(app).get("/api/profile/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Profile not found");
  });

  // Edge case 8: Roadmap with missing missingSkills
  test("POST /api/roadmap/generate rejects missing missingSkills", async () => {
    const res = await request(app).post("/api/roadmap/generate").send({
      targetRole: "Engineer",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("missingSkills");
  });

  // Edge case 9: Role not found returns 404
  test("GET /api/analyze/roles/:id returns 404 for bad id", async () => {
    const res = await request(app).get("/api/analyze/roles/jd-9999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Role not found");
  });

  // Edge case 10: Profile name too short
  test("POST /api/profile rejects name with fewer than 2 characters", async () => {
    const res = await request(app).post("/api/profile").send({
      name: "A",
      targetRole: "Engineer",
      skills: ["Python"],
    });
    expect(res.status).toBe(400);
  });
});

// Resume Parsing — Edge Cases
describe("Resume Parsing — Edge Cases", () => {
  // Edge case 11: No file uploaded
  test("POST /api/resume/parse returns 400 when no file attached", async () => {
    const res = await request(app).post("/api/resume/parse");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // Edge case 12: Wrong file type (non-PDF)
  test("POST /api/resume/parse returns 400 for non-PDF file", async () => {
    const res = await request(app)
      .post("/api/resume/parse")
      .attach("resume", Buffer.from("hello world"), {
        filename: "resume.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // Edge case 13: File too large (over 5MB)
  test("POST /api/resume/parse returns 400 for file over 5MB", async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024, "a"); // 6MB
    const res = await request(app)
      .post("/api/resume/parse")
      .attach("resume", bigBuffer, {
        filename: "huge.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/large/i);
  });
});
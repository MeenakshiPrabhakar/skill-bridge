import { useState, useRef } from "react";

const ROLES = [
  "Cloud Engineer", "Machine Learning Engineer", "Full Stack Developer",
  "Data Engineer", "DevOps Engineer", "Backend Engineer",
  "AI/LLM Engineer", "Cybersecurity Analyst"
];

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "SQL", "Bash",
  "React", "Node.js", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
  "Git", "Linux", "CI/CD", "REST APIs", "GraphQL", "PostgreSQL", "MongoDB",
  "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "LangChain",
  "Kafka", "Spark", "Airflow", "dbt", "System Design", "Microservices",
];

// ── Shared sub-components ──────────────────────────────────────

function BasicInfoForm({ form, setForm, errors, setErrors }) {
  return (
    <div className="card fade-up fade-up-1">
      <div className="section-label" style={{ marginBottom: 16 }}>Basic Info</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name *</label>
          <input type="text" placeholder="e.g. Alex Chen" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(x => ({ ...x, name: undefined })); }} />
          {errors.name && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Target Role *</label>
          <select value={form.targetRole}
            onChange={e => { setForm(f => ({ ...f, targetRole: e.target.value })); setErrors(x => ({ ...x, targetRole: undefined })); }}>
            <option value="">— Select a role —</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {errors.targetRole && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{errors.targetRole}</div>}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Experience</label>
          <input type="text" placeholder="e.g. 2 years backend development" value={form.experience}
            onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>Education</label>
          <input type="text" placeholder="e.g. B.Sc. Computer Science" value={form.education}
            onChange={e => setForm(f => ({ ...f, education: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>GitHub URL</label>
          <input type="url" placeholder="https://github.com/username" value={form.githubUrl}
            onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} />
        </div>
      </div>
    </div>
  );
}

function SkillsPanel({ skills, onAdd, onRemove, errors }) {
  const [skillInput, setSkillInput] = useState("");
  const filtered = SKILL_SUGGESTIONS.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !skills.map(x => x.toLowerCase()).includes(s.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="card fade-up fade-up-2">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="section-label">Current Skills *</div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{skills.length} added</span>
      </div>

      <div style={{ position: "relative", marginBottom: 12 }}>
        <input type="text" placeholder="Type a skill and press Enter..."
          value={skillInput}
          onChange={e => setSkillInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(skillInput); setSkillInput(""); } }}
        />
        {skillInput && filtered.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
            borderRadius: "var(--radius)", zIndex: 10, overflow: "hidden",
          }}>
            {filtered.map(s => (
              <button key={s} onClick={() => { onAdd(s); setSkillInput(""); }} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 14px", background: "transparent", border: "none",
                color: "var(--text-primary)", cursor: "pointer", fontSize: 13,
                fontFamily: "var(--font-body)", borderBottom: "1px solid var(--border)",
              }}
                onMouseEnter={e => e.target.style.background = "var(--accent-dim)"}
                onMouseLeave={e => e.target.style.background = "transparent"}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {errors.skills && <div style={{ color: "var(--error)", fontSize: 12, marginBottom: 8 }}>{errors.skills}</div>}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>QUICK ADD</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SKILL_SUGGESTIONS
            .filter(s => !skills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
            .slice(0, 12).map(s => (
              <button key={s} onClick={() => onAdd(s)} className="tag tag-gray"
                style={{ cursor: "pointer", border: "1px dashed var(--border-bright)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-bright)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                + {s}
              </button>
            ))}
        </div>
      </div>

      <hr className="divider" />

      {skills.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>◎</div>
          <div style={{ fontSize: 13 }}>No skills added yet</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.map(s => (
            <span key={s} className="tag tag-green" style={{ cursor: "pointer" }}
              onClick={() => onRemove(s)} title="Click to remove">
              {s} ×
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function ProfileSetup({ profile, onSave }) {
  const [inputMode, setInputMode] = useState("resume");

  // GitHub state
  const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubResult, setGithubResult] = useState(null);
  const [githubError, setGithubError] = useState("");

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(profile || {
    name: "", targetRole: "", skills: [], experience: "", education: "", githubUrl: "", notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.targetRole) e.targetRole = "Please select a target role";
    if (form.skills.length === 0) e.skills = "Add at least one skill";
    return e;
  }

  function addSkill(skill) {
    const s = skill.trim();
    if (!s || form.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())) return;
    setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setErrors(e => ({ ...e, skills: undefined }));
  }

  function removeSkill(skill) {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  }

  // ── Resume upload ──
  async function parseResume(file) {
    if (!file || file.type !== "application/pdf") {
      setResumeError("Please upload a PDF file.");
      return;
    }
    setResumeFile(file);
    setResumeLoading(true);
    setResumeError("");
    setResumeResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      setResumeResult(data);
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setResumeLoading(false);
    }
  }

  function importResumeData() {
    if (!resumeResult) return;
    const { extracted } = resumeResult;
    setForm(f => ({
      ...f,
      name: extracted.name || f.name,
      experience: extracted.experience || f.experience,
      education: extracted.education || f.education,
      skills: [
        ...f.skills,
        ...extracted.skills.filter(s => !f.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())),
      ],
    }));
    setErrors(e => ({ ...e, skills: undefined }));
    setResumeResult(null);
    setResumeFile(null);
  }

  // ── GitHub lookup ──
  async function fetchGithubProfile() {
    const username = githubUsername.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
    if (!username) return;
    setGithubLoading(true);
    setGithubError("");
    setGithubResult(null);
    try {
      const res = await fetch(`/api/github/${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch GitHub profile");
      setGithubResult(data);
    } catch (err) {
      setGithubError(err.message);
    } finally {
      setGithubLoading(false);
    }
  }

  function importGithubProfile() {
    if (!githubResult) return;
    const { profile: ghProfile, detectedSkills } = githubResult;
    setForm(f => ({
      ...f,
      name: f.name || ghProfile.name,
      githubUrl: ghProfile.githubUrl,
      skills: [
        ...f.skills,
        ...detectedSkills.filter(s => !f.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())),
      ],
    }));
    setErrors(e => ({ ...e, skills: undefined }));
    setGithubResult(null);
    setGithubUsername("");
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setServerError("");
    try {
      const endpoint = profile?.id ? `/api/profile/${profile.id}` : "/api/profile";
      const method = profile?.id ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details?.join(", ") || data.error);
      onSave(data.profile);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const MODES = [
    { id: "resume", icon: "📄", label: "Resume Upload", desc: "Parse a PDF resume" },
    { id: "github", icon: "⌥", label: "GitHub Import", desc: "Scan repos for skills" },
    { id: "manual", icon: "✎", label: "Manual Entry", desc: "Type your info directly" },
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Step 1 of 4</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Build Your <span style={{ color: "var(--accent)" }}>Profile</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8, maxWidth: 560 }}>
          Upload your resume, import from GitHub, or enter skills manually.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => {
            setInputMode(m.id);
            setGithubResult(null); setGithubError("");
            setResumeResult(null); setResumeError(""); setResumeFile(null);
          }} style={{
            background: inputMode === m.id ? "var(--accent-dim)" : "var(--bg-card)",
            border: `1px solid ${inputMode === m.id ? "rgba(137,180,250,0.4)" : "var(--border)"}`,
            borderRadius: "var(--radius-lg)",
            color: inputMode === m.id ? "var(--accent)" : "var(--text-secondary)",
            cursor: "pointer", padding: "12px 20px",
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
            textAlign: "left", transition: "all 0.18s",
          }}>
            <span style={{ marginRight: 6 }}>{m.icon}</span>{m.label}
            <div style={{ fontSize: 11, fontFamily: "var(--font-body)", fontWeight: 400, color: "var(--text-muted)", marginTop: 2 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ── RESUME MODE ── */}
      {inputMode === "resume" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Upload card */}
            <div className="card fade-up" style={{ border: "1px solid rgba(137,180,250,0.25)", background: "rgba(137,180,250,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34, height: 34, background: "var(--accent-dim)",
                  border: "1px solid rgba(137,180,250,0.3)", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>📄</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>Resume Parser</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Upload a PDF — AI extracts your skills automatically</div>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) parseResume(file);
                }}
                style={{
                  border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border-bright)"}`,
                  borderRadius: "var(--radius)",
                  padding: "32px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "var(--accent-dim)" : "var(--bg-elevated)",
                  transition: "all 0.2s",
                  marginBottom: 12,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={e => { if (e.target.files[0]) parseResume(e.target.files[0]); }}
                />
                {resumeLoading ? (
                  <div>
                    <div className="spinner" style={{ width: 28, height: 28, margin: "0 auto 10px" }} />
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Parsing resume…</div>
                  </div>
                ) : resumeFile && !resumeResult ? (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    📎 {resumeFile.name}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                    <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Drop your PDF here or <span style={{ color: "var(--accent)" }}>click to browse</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PDF only · Max 5MB</div>
                  </div>
                )}
              </div>

              {resumeError && <div className="error-box" style={{ marginBottom: 12 }}>⚠ {resumeError}</div>}

              {/* Parsed result preview */}
              {resumeResult && (
                <div style={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: 14,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                      ✓ PARSED · {resumeResult.meta.pageCount} PAGE{resumeResult.meta.pageCount !== 1 ? "S" : ""}
                    </div>
                    <span className={`source-badge ${resumeResult.source === "ai" ? "source-ai" : "source-fallback"}`}>
                      {resumeResult.source === "ai" ? "AI Extracted" : "Rule-Based"}
                    </span>
                  </div>

                  {resumeResult.extracted.name && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>NAME </span>
                      <span style={{ fontSize: 13 }}>{resumeResult.extracted.name}</span>
                    </div>
                  )}
                  {resumeResult.extracted.experience && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>EXPERIENCE </span>
                      <span style={{ fontSize: 13 }}>{resumeResult.extracted.experience}</span>
                    </div>
                  )}
                  {resumeResult.extracted.education && (
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>EDUCATION </span>
                      <span style={{ fontSize: 13 }}>{resumeResult.extracted.education}</span>
                    </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
                      {resumeResult.extracted.skills.length} SKILLS DETECTED
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {resumeResult.extracted.skills.map(s => (
                        <span key={s} className="tag tag-green" style={{ fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={importResumeData}
                    style={{ width: "100%", justifyContent: "center" }}>
                    Import Resume Data →
                  </button>
                </div>
              )}
            </div>

            <BasicInfoForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
          </div>

          <SkillsPanel skills={form.skills} onAdd={addSkill} onRemove={removeSkill} errors={errors} />
        </div>
      )}

      {/* ── GITHUB MODE ── */}
      {inputMode === "github" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card fade-up" style={{ border: "1px solid rgba(137,180,250,0.25)", background: "rgba(137,180,250,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 34, height: 34, background: "var(--accent-dim)",
                  border: "1px solid rgba(137,180,250,0.3)", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>⌥</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>GitHub Profile Import</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Enter your username — we'll scan your repos</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)", pointerEvents: "none",
                  }}>github.com/</div>
                  <input type="text" placeholder="your-username"
                    value={githubUsername}
                    onChange={e => { setGithubUsername(e.target.value); setGithubError(""); setGithubResult(null); }}
                    onKeyDown={e => { if (e.key === "Enter") fetchGithubProfile(); }}
                    style={{ paddingLeft: 96, fontFamily: "var(--font-mono)" }}
                  />
                </div>
                <button className="btn btn-primary" onClick={fetchGithubProfile}
                  disabled={!githubUsername.trim() || githubLoading} style={{ flexShrink: 0 }}>
                  {githubLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Scanning…</> : "Scan →"}
                </button>
              </div>

              {githubError && <div className="error-box" style={{ marginBottom: 12 }}>⚠ {githubError}</div>}

              {githubResult && (
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <img src={githubResult.profile.avatarUrl} alt="avatar"
                      style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid var(--border-bright)" }} />
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{githubResult.profile.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        @{githubResult.profile.username} · {githubResult.profile.publicRepos} repos
                      </div>
                    </div>
                  </div>

                  {githubResult.rawData.topLanguages.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>TOP LANGUAGES</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {githubResult.rawData.topLanguages.map(l => <span key={l} className="tag tag-blue" style={{ fontSize: 11 }}>{l}</span>)}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
                      ✓ {githubResult.detectedSkills.length} SKILLS DETECTED
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {githubResult.detectedSkills.map(s => <span key={s} className="tag tag-green" style={{ fontSize: 11 }}>{s}</span>)}
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={importGithubProfile}
                    style={{ width: "100%", justifyContent: "center" }}>
                    Import Profile & Skills →
                  </button>
                </div>
              )}

              {!githubResult && !githubError && !githubLoading && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  Enter your GitHub username and click <strong style={{ color: "var(--text-secondary)" }}>Scan</strong>
                </div>
              )}
            </div>

            <BasicInfoForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
          </div>

          <SkillsPanel skills={form.skills} onAdd={addSkill} onRemove={removeSkill} errors={errors} />
        </div>
      )}

      {/* ── MANUAL MODE ── */}
      {inputMode === "manual" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <BasicInfoForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
          <SkillsPanel skills={form.skills} onAdd={addSkill} onRemove={removeSkill} errors={errors} />
        </div>
      )}

      {serverError && <div className="error-box" style={{ marginTop: 20 }}>⚠ {serverError}</div>}

      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: 15, padding: "12px 32px" }}>
          {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : "Save & Analyze Gap →"}
        </button>
      </div>
    </div>
  );
}
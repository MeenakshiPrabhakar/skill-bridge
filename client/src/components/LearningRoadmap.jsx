import { useState, useEffect } from "react";

const COST_COLORS = {
  free: "tag-green",
  "free-audit": "tag-blue",
  "free-trial": "tag-amber",
  paid: "tag-gray",
};

function CourseCard({ course, index }) {
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-bright)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{course.title}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{course.provider}</div>
        </div>
        <span className={`tag ${COST_COLORS[course.cost] || "tag-gray"}`} style={{ flexShrink: 0 }}>
          {course.cost}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {(course.skill_tags || []).slice(0, 4).map(t => (
          <span key={t} className="tag tag-gray" style={{ fontSize: 10 }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          ⏱ {course.duration_hours}h · {course.difficulty}
        </span>
        {course.url && (
          <a href={course.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)" }}
            onClick={e => e.stopPropagation()}>
            View →
          </a>
        )}
      </div>
    </div>
  );
}

export default function LearningRoadmap({ profile, gapResult }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState(6);
  const [source, setSource] = useState("ai");

  async function generate() {
    setLoading(true);
    setError("");
    const a = gapResult.analysis;
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missingSkills: [...(a.missing_required || []), ...(a.quick_wins || [])].slice(0, 8),
          targetRole: gapResult.targetJob?.role || profile.targetRole,
          currentSkills: profile.skills,
          timeframeMonths: timeframe,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoadmap(data.roadmap);
      setSource(data.source);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { generate(); }, []);

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Step 3 of 4</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Learning <span style={{ color: "var(--accent)" }}>Roadmap</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          A personalized, phased plan to close your skills gap and become job-ready.
        </p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="section-label">Timeframe:</div>
        {[3, 6, 9, 12].map(m => (
          <button key={m} onClick={() => setTimeframe(m)}
            className={timeframe === m ? "btn btn-primary" : "btn btn-ghost"}
            style={{ padding: "6px 16px", fontSize: 13 }}>
            {m} months
          </button>
        ))}
        <button className="btn btn-ghost" style={{ marginLeft: "auto" }} onClick={generate} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating…</> : "↺ Regenerate"}
        </button>
        {source && <span className={`source-badge ${source === "ai" ? "source-ai" : "source-fallback"}`}>{source === "ai" ? "AI" : "Rule-Based"}</span>}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Building your roadmap…</div>
        </div>
      )}

      {error && <div className="error-box">⚠ {error}</div>}

      {!loading && roadmap && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary bar */}
          <div className="card fade-up" style={{ background: "var(--accent-dim)", borderColor: "rgba(0,212,170,0.2)", display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>Plan Summary</div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 600 }}>{roadmap.summary}</p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>
                {roadmap.total_hours}+
              </div>
              <div className="section-label">hours of content</div>
            </div>
          </div>

          {/* Phases */}
          {(roadmap.phases || []).map((phase) => (
            <div key={phase.phase} className="card fade-up">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36,
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(0,212,170,0.3)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  color: "var(--accent)",
                }}>
                  {phase.phase}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{phase.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {phase.duration} · {phase.focus}
                  </div>
                </div>
              </div>
              {(phase.resources || []).length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {phase.resources.map((c, i) => <CourseCard key={c.id || i} course={c} index={i} />)}
                </div>
              ) : (
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No specific resources for this phase yet.</div>
              )}
            </div>
          ))}

          {/* Projects */}
          {roadmap.projects?.length > 0 && (
            <div className="card fade-up">
              <div className="section-label" style={{ marginBottom: 14 }}>🛠 Hands-On Projects</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {roadmap.projects.map((p, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", marginTop: 2, minWidth: 20 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 14 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

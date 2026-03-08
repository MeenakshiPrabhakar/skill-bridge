import { useState, useEffect, useRef } from "react";

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "var(--accent)" : score >= 40 ? "var(--amber)" : "var(--error)";
  return (
    <div className="score-ring" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      </svg>
      <div className="score-label">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color }}>{score}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>/100</div>
      </div>
    </div>
  );
}

function SkillBar({ label, pct, delay = 0 }) {
  const barRef = useRef(null);
  const color = pct >= 70 ? "var(--accent)" : pct >= 40 ? "var(--amber)" : "var(--error)";
  const glowColor = pct >= 70 ? "rgba(137,180,250,0.3)" : pct >= 40 ? "rgba(245,166,35,0.3)" : "rgba(255,77,109,0.3)";

  useEffect(() => {
    // Use requestAnimationFrame to ensure the element is painted at 0 first
    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        if (barRef.current) {
          barRef.current.style.width = `${pct}%`;
        }
      });
    }, delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{
        height: 8,
        background: "var(--bg-elevated)",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}>
        <div
          ref={barRef}
          style={{
            height: "100%",
            width: "0%", // start at 0
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            borderRadius: 4,
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 10px ${glowColor}`,
          }}
        />
      </div>
    </div>
  );
}

function buildCategories(matched, missing) {
  const categories = {
    "Cloud & Infra": ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "Linux", "Networking"],
    "Languages": ["Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "SQL", "Bash", "Scala"],
    "Data & ML": ["PyTorch", "TensorFlow", "Machine Learning", "Spark", "Kafka", "Airflow", "dbt", "Statistics"],
    "Web & APIs": ["React", "Node.js", "REST APIs", "GraphQL", "FastAPI", "Microservices", "System Design"],
    "DevOps": ["CI/CD", "Git", "Monitoring", "Ansible", "Helm", "Prometheus"],
  };
  const allMatched = matched.map(s => s.toLowerCase());
  const allMissing = missing.map(s => s.toLowerCase());
  return Object.entries(categories).map(([cat, skills]) => {
    const relevant = skills.filter(s =>
      allMatched.includes(s.toLowerCase()) || allMissing.includes(s.toLowerCase())
    );
    if (relevant.length === 0) return null;
    const have = relevant.filter(s => allMatched.includes(s.toLowerCase())).length;
    const pct = Math.round((have / relevant.length) * 100);
    return { cat, pct, have, total: relevant.length };
  }).filter(Boolean);
}

export default function GapAnalysis({ profile, onResult, gapResult }) {
  const [result, setResult] = useState(gapResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [barsReady, setBarsReady] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setBarsReady(false);
    try {
      const res = await fetch("/api/analyze/gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details?.join(", ") || data.error);
      setResult(data);
      onResult(data);
      // Small delay so bars mount at 0% before animating
      setTimeout(() => setBarsReady(true), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!result) {
      runAnalysis();
    } else {
      setTimeout(() => setBarsReady(true), 300);
    }
  }, []);

  const a = result?.analysis;
  const categories = a ? buildCategories(a.matched_required || [], a.missing_required || []) : [];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 40 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Step 2 of 4</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Skills <span style={{ color: "var(--accent)" }}>Gap Analysis</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          AI-powered comparison of your skills against{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {result?.targetJob?.role || profile.targetRole}
          </strong> requirements.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Analyzing your profile…</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>Comparing against job requirements</div>
        </div>
      )}

      {error && (
        <div>
          <div className="error-box">⚠ {error}</div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={runAnalysis}>Retry</button>
        </div>
      )}

      {!loading && a && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Top row */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 20 }}>
            <div className="card fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minWidth: 180 }}>
              <div className="section-label">Readiness Score</div>
              <ScoreRing score={a.score} />
              <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
                {a.score >= 70 ? "Strong candidate" : a.score >= 40 ? "Developing" : "Needs work"}
              </div>
              <span className={`source-badge ${result.source === "ai" ? "source-ai" : "source-fallback"}`}>
                {result.source === "ai" ? "AI Analysis" : "Rule-Based"}
              </span>
            </div>

            <div className="card fade-up fade-up-1">
              <div className="section-label" style={{ marginBottom: 12 }}>Target Position</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                {result.targetJob?.role}
              </div>
              <div style={{ color: "var(--text-secondary)", marginBottom: 16 }}>{result.targetJob?.company}</div>
              <span className="tag tag-blue" style={{ width: "fit-content", marginBottom: 8 }}>{result.targetJob?.level}</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
                {result.targetJob?.salary_range}
              </div>
            </div>

            <div className="card fade-up fade-up-2">
              <div className="section-label" style={{ marginBottom: 12 }}>AI Summary</div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, fontSize: 14 }}>{a.summary}</p>
              {a.strengths?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>TOP STRENGTHS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {a.strengths.map(s => <span key={s} className="tag tag-green">✓ {s}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skill bars + required skills */}
          {categories.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card fade-up">
                <div className="section-label" style={{ marginBottom: 20 }}>Readiness by Category</div>
                {barsReady && categories.map((c, i) => (
                  <SkillBar key={c.cat} label={c.cat} pct={c.pct} delay={i * 120} />
                ))}
                {!barsReady && categories.map(c => (
                  <div key={c.cat} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{c.cat}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>–%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 4, border: "1px solid var(--border)" }} />
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                  Based on required skills for {result.targetJob?.role}
                </div>
              </div>

              <div className="card fade-up fade-up-1">
                <div className="section-label" style={{ marginBottom: 14 }}>Required Skills Detail</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {a.matched_required?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                        YOU HAVE ({a.matched_required.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {a.matched_required.map(s => <span key={s} className="tag tag-green">✓ {s}</span>)}
                      </div>
                    </div>
                  )}
                  {a.missing_required?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                        MISSING ({a.missing_required.length})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {a.missing_required.map(s => <span key={s} className="tag tag-red">✗ {s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferred + quick wins + certs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card fade-up">
              <div className="section-label" style={{ marginBottom: 14 }}>Preferred Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {a.matched_preferred?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>YOU HAVE ({a.matched_preferred.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.matched_preferred.map(s => <span key={s} className="tag tag-green">✓ {s}</span>)}
                    </div>
                  </div>
                )}
                {a.missing_preferred?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>NICE TO ADD ({a.missing_preferred.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.missing_preferred.map(s => <span key={s} className="tag tag-amber">+ {s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card fade-up fade-up-1">
                <div className="section-label" style={{ marginBottom: 10 }}>⚡ Quick Wins</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {a.quick_wins?.map((q, i) => (
                    <div key={q} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", background: "var(--bg-elevated)",
                      borderRadius: "var(--radius)", border: "1px solid var(--border)",
                    }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", minWidth: 20 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 13 }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card fade-up fade-up-2">
                <div className="section-label" style={{ marginBottom: 10 }}>🏆 Certs to Pursue</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {a.certifications_to_pursue?.map(c => (
                    <div key={c} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", background: "var(--amber-dim)",
                      borderRadius: "var(--radius)", border: "1px solid rgba(245,166,35,0.2)",
                    }}>
                      <span style={{ color: "var(--amber)" }}>◈</span>
                      <span style={{ fontSize: 13 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={runAnalysis}>↺ Re-analyze</button>
          </div>
        </div>
      )}
    </div>
  );
}
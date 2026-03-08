import { useState } from "react";

const DIFFICULTY_COLOR = { Easy: "tag-green", Medium: "tag-amber", Hard: "tag-red" };
const TYPE_ICON = { conceptual: "📐", coding: "💻", system_design: "🏗", behavioral: "🗣" };

function QuestionCard({ q, index, isRevealed, onReveal }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 22px",
      transition: "border-color 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-bright)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          minWidth: 36, height: 36,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-bright)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <span className={`tag ${DIFFICULTY_COLOR[q.difficulty] || "tag-gray"}`}>{q.difficulty}</span>
            <span className="tag tag-gray">{TYPE_ICON[q.type] || "◎"} {q.type?.replace("_", " ")}</span>
            {q.skill_tested && <span className="tag tag-blue">{q.skill_tested}</span>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, marginBottom: 12 }}>{q.question}</div>

          {q.hint && (
            <div>
              {!isRevealed ? (
                <button className="btn btn-ghost" onClick={onReveal} style={{ fontSize: 12, padding: "5px 12px" }}>
                  💡 Show interviewer hint
                </button>
              ) : (
                <div style={{
                  background: "var(--amber-dim)",
                  border: "1px solid rgba(245,166,35,0.2)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "var(--amber)",
                }}>
                  💡 <strong>Hint:</strong> {q.hint}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MockInterview({ profile, gapResult }) {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("ai");
  const [revealed, setRevealed] = useState({});
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Mixed");

  // Skills to focus on: newly learned (quick wins) + missing required
  const focusSkills = [
    ...(gapResult.analysis?.quick_wins || []),
    ...(gapResult.analysis?.missing_required || []),
  ].slice(0, 6);

  async function generate() {
    if (focusSkills.length === 0) {
      setError("No skills to generate questions for. Complete gap analysis first.");
      return;
    }
    setLoading(true);
    setError("");
    setRevealed({});
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: focusSkills,
          targetRole: gapResult.targetJob?.role || profile.targetRole,
          count,
          difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInterview(data.interview);
      setSource(data.source);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Step 4 of 4</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Interview <span style={{ color: "var(--accent)" }}>Prep</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          AI-generated questions focused on the skills you're actively building.
        </p>
      </div>

      {/* Config card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>Focus Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {focusSkills.map(s => <span key={s} className="tag tag-red">{s}</span>)}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>Questions</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[3, 5, 8, 10].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className={count === n ? "btn btn-primary" : "btn btn-ghost"}
                  style={{ padding: "5px 14px", fontSize: 13 }}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>Difficulty</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Mixed", "Easy", "Medium", "Hard"].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={difficulty === d ? "btn btn-primary" : "btn btn-ghost"}
                  style={{ padding: "5px 14px", fontSize: 13 }}>{d}</button>
              ))}
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={loading}
            style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
            {loading
              ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating…</>
              : interview ? "↺ New Questions" : "Generate Questions"}
          </button>
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 20 }}>⚠ {error}</div>}

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Generating interview questions…</div>
        </div>
      )}

      {!loading && !interview && !error && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◇</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 8 }}>Ready to Practice?</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Hit "Generate Questions" to begin your mock interview prep.</div>
        </div>
      )}

      {!loading && interview && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                {interview.role || gapResult.targetJob?.role} Interview
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                {interview.questions?.length} questions · Click "Show interviewer hint" to see model answer guidance
              </div>
            </div>
            <span className={`source-badge ${source === "ai" ? "source-ai" : "source-fallback"}`}>
              {source === "ai" ? "AI Generated" : "Rule-Based"}
            </span>
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(interview.questions || []).map((q, i) => (
              <QuestionCard
                key={i}
                q={q}
                index={i}
                isRevealed={!!revealed[i]}
                onReveal={() => setRevealed(r => ({ ...r, [i]: true }))}
              />
            ))}
          </div>

          {/* Tips */}
          {interview.tips?.length > 0 && (
            <div className="card fade-up" style={{ background: "var(--accent-dim)", borderColor: "rgba(0,212,170,0.2)" }}>
              <div className="section-label" style={{ marginBottom: 12 }}>✦ Interview Tips</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {interview.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 14 }}>
                    <span style={{ color: "var(--accent)" }}>→</span>
                    <span style={{ color: "var(--text-secondary)" }}>{tip}</span>
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

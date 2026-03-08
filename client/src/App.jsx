import { useState } from "react";
import ProfileSetup from "./components/ProfileSetup.jsx";
import GapAnalysis from "./components/GapAnalysis.jsx";
import LearningRoadmap from "./components/LearningRoadmap.jsx";
import MockInterview from "./components/MockInterview.jsx";

const NAV = [
  { id: "profile", label: "Profile", icon: "◈" },
  { id: "gap", label: "Gap Analysis", icon: "◉" },
  { id: "roadmap", label: "Roadmap", icon: "◎" },
  { id: "interview", label: "Interview Prep", icon: "◇" },
];

export default function App() {
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [gapResult, setGapResult] = useState(null);

  const isUnlocked = (id) => {
    if (id === "profile") return true;
    if (id === "gap") return !!profile;
    if (id === "roadmap") return !!gapResult;
    if (id === "interview") return !!gapResult;
    return false;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,13,20,0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "var(--accent)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}>🚀</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>
                Skill<span style={{ color: "var(--accent)" }}>Bridge</span>
              </div>
              <div className="section-label" style={{ marginTop: -2 }}>Career Navigator</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4 }}>
            {NAV.map((n) => {
              const unlocked = isUnlocked(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => unlocked && setTab(n.id)}
                  style={{
                    background: tab === n.id ? "var(--accent-dim)" : "transparent",
                    border: "1px solid",
                    borderColor: tab === n.id ? "rgba(0,212,170,0.3)" : "transparent",
                    borderRadius: "var(--radius)",
                    color: tab === n.id ? "var(--accent)" : unlocked ? "var(--text-secondary)" : "var(--text-muted)",
                    cursor: unlocked ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "6px 14px",
                    transition: "all 0.18s",
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{n.icon}</span>
                  {n.label}
                </button>
              );
            })}
          </nav>

          {/* Profile pill */}
          {profile && (
            <div style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "5px 12px 5px 8px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}>
              <div style={{
                width: 24, height: 24,
                background: "var(--accent-dim)",
                border: "1px solid rgba(0,212,170,0.3)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "var(--accent)",
                fontWeight: 700,
              }}>
                {profile.name[0].toUpperCase()}
              </div>
              <span style={{ color: "var(--text-secondary)" }}>{profile.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "40px 24px" }}>
        {tab === "profile" && (
          <ProfileSetup profile={profile} onSave={(p) => { setProfile(p); setTab("gap"); }} />
        )}
        {tab === "gap" && profile && (
          <GapAnalysis profile={profile} onResult={(r) => { setGapResult(r); }} gapResult={gapResult} />
        )}
        {tab === "roadmap" && gapResult && (
          <LearningRoadmap profile={profile} gapResult={gapResult} />
        )}
        {tab === "interview" && gapResult && (
          <MockInterview profile={profile} gapResult={gapResult} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "16px 24px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
      }}>
        Skill-Bridge · Career Navigator · Synthetic data only · No real personal data stored
      </footer>
    </div>
  );
}

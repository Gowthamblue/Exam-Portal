import { useNavigate } from "react-router-dom";

const features = [
  { icon: "🤖", title: "AI-Powered MCQs",      desc: "Auto-generate assessments from study materials using advanced AI" },
  { icon: "📊", title: "Performance Analytics", desc: "Track scores, averages and progress with real-time dashboards" },
  { icon: "📚", title: "Study Materials",       desc: "Access department-specific resources uploaded by faculty" },
  { icon: "📝", title: "Smart Assessments",     desc: "Timed in-app tests with instant auto-scoring and review" },
  { icon: "📢", title: "Announcements",         desc: "Stay updated with priority-based department notifications" },
  { icon: "🔒", title: "Secure & Role-Based",   desc: "Separate portals for students and administrators" },
];

const stats = [
  { value: "AI", label: "Powered MCQ Generation" },
  { value: "100%", label: "Auto Scoring Accuracy" },
  { value: "Real-time", label: "Performance Tracking" },
  { value: "Free", label: "Firebase Hosted" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .home-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(2, 20, 44, 0.97);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 6%; height: 64px;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo  { width: 36px; height: 36px; background: linear-gradient(135deg,#3b82f6,#6366f1);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 13px; flex-shrink: 0; }
        .nav-title { color: #f1f5f9; font-weight: 700; font-size: 1rem; }
        .nav-title span { color: #60a5fa; }
        .nav-links { display: flex; gap: 10px; }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,.2);
          color: #e2e8f0; padding: 8px 20px; border-radius: 8px; cursor: pointer;
          font-size: .875rem; font-weight: 500; transition: all .15s;
          font-family: inherit; }
        .btn-ghost:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.35); }
        .btn-primary-nav { background: linear-gradient(135deg,#1d4ed8,#4f46e5);
          border: none; color: #fff; padding: 8px 22px; border-radius: 8px; cursor: pointer;
          font-size: .875rem; font-weight: 600; transition: all .15s;
          font-family: inherit; box-shadow: 0 2px 8px rgba(29,78,216,.35); }
        .btn-primary-nav:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(29,78,216,.45); }

        /* Hero */
        .hero {
          background: linear-gradient(135deg, #02142c 0%, #0f2544 50%, #1a1a3e 100%);
          padding: 90px 6% 80px; text-align: center; position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,.15), transparent);
          pointer-events: none;
        }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.3);
          color: #93c5fd; padding: 5px 14px; border-radius: 20px;
          font-size: .78rem; font-weight: 600; margin-bottom: 24px; }
        .hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; color: #f1f5f9;
          line-height: 1.15; margin-bottom: 18px; letter-spacing: -.02em; }
        .hero h1 span { background: linear-gradient(90deg,#60a5fa,#a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: clamp(.95rem, 2vw, 1.1rem); color: #94a3b8; max-width: 580px;
          margin: 0 auto 36px; line-height: 1.7; }
        .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-hero-main { background: linear-gradient(135deg,#1d4ed8,#4f46e5); border: none;
          color: #fff; padding: 14px 32px; border-radius: 10px; cursor: pointer;
          font-size: 1rem; font-weight: 700; font-family: inherit;
          box-shadow: 0 4px 20px rgba(29,78,216,.4); transition: all .2s; }
        .btn-hero-main:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(29,78,216,.5); }
        .btn-hero-sec { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.2);
          color: #e2e8f0; padding: 14px 32px; border-radius: 10px; cursor: pointer;
          font-size: 1rem; font-weight: 600; font-family: inherit; transition: all .2s; }
        .btn-hero-sec:hover { background: rgba(255,255,255,.12); transform: translateY(-2px); }

        /* Stats */
        .stats-bar { background: #fff; border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: center; flex-wrap: wrap; gap: 0; }
        .stat-item { padding: 28px 48px; text-align: center; border-right: 1px solid #e2e8f0; }
        .stat-item:last-child { border-right: none; }
        .stat-value { font-size: 1.6rem; font-weight: 800; color: #0f172a; line-height: 1; }
        .stat-label { font-size: .78rem; color: #64748b; margin-top: 4px; font-weight: 500; }

        /* Features */
        .section { padding: 72px 6%; }
        .section-label { font-size: .78rem; font-weight: 700; color: #1d4ed8;
          text-transform: uppercase; letter-spacing: .08em; text-align: center; margin-bottom: 10px; }
        .section-title { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; color: #0f172a;
          text-align: center; margin-bottom: 10px; letter-spacing: -.02em; }
        .section-sub { font-size: .95rem; color: #64748b; text-align: center;
          max-width: 480px; margin: 0 auto 48px; line-height: 1.6; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .feature-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 24px; transition: all .2s; }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08);
          border-color: #bfdbfe; }
        .feature-icon { width: 46px; height: 46px; background: #eff6ff; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; margin-bottom: 14px; }
        .feature-title { font-size: .95rem; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .feature-desc  { font-size: .85rem; color: #64748b; line-height: 1.6; }

        /* CTA */
        .cta-section { background: linear-gradient(135deg,#02142c,#0f2544);
          padding: 72px 6%; text-align: center; }
        .cta-section h2 { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800;
          color: #f1f5f9; margin-bottom: 12px; letter-spacing: -.02em; }
        .cta-section p { color: #94a3b8; font-size: .95rem; margin-bottom: 32px; }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-cta-main { background: linear-gradient(135deg,#1d4ed8,#4f46e5);
          border: none; color: #fff; padding: 13px 32px; border-radius: 10px;
          cursor: pointer; font-size: .95rem; font-weight: 700; font-family: inherit;
          box-shadow: 0 4px 16px rgba(29,78,216,.4); transition: all .2s; }
        .btn-cta-main:hover { transform: translateY(-2px); }
        .btn-cta-sec { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.2);
          color: #e2e8f0; padding: 13px 32px; border-radius: 10px; cursor: pointer;
          font-size: .95rem; font-weight: 600; font-family: inherit; transition: all .2s; }
        .btn-cta-sec:hover { background: rgba(255,255,255,.14); transform: translateY(-2px); }

        /* Footer */
        .footer { background: #02142c; border-top: 1px solid #0d2540;
          padding: 28px 6%; display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-brand { color: #94a3b8; font-size: .85rem; }
        .footer-brand strong { color: #60a5fa; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { color: #64748b; font-size: .82rem; cursor: pointer;
          transition: color .15s; text-decoration: none; }
        .footer-link:hover { color: #94a3b8; }

        @media(max-width: 640px) {
          .hero { padding: 60px 5% 56px; }
          .stat-item { padding: 20px 24px; }
          .section { padding: 52px 5%; }
          .nav-links .btn-ghost { display: none; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="home-nav">
        <a className="nav-brand" href="/">
          <div className="nav-logo">EP</div>
          <span className="nav-title">Exam<span>Prep</span></span>
        </a>
        <div className="nav-links">
          <button className="btn-ghost" onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn-primary-nav" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">🎓 Built for M. Kumarasamy College of Engineering</div>
        <h1>Competitive Exam Prep<br /><span>Powered by AI</span></h1>
        <p>
          A smart platform for students to practice assessments, track performance,
          and access study materials — all in one place.
        </p>
        <div className="hero-btns">
          <button className="btn-hero-main" onClick={() => navigate("/register")}>
            Get Started Free →
          </button>
          <button className="btn-hero-sec" onClick={() => navigate("/login")}>
            Sign In to Portal
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats-bar">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="section" style={{ background: "#f8fafc" }}>
        <div className="section-label">Platform Features</div>
        <h2 className="section-title">Everything you need to excel</h2>
        <p className="section-sub">
          From AI-generated tests to real-time analytics — built specifically
          for engineering students preparing for competitive exams.
        </p>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Ready to start your preparation?</h2>
        <p>Join your department and start practicing with AI-powered assessments today.</p>
        <div className="cta-btns">
          <button className="btn-cta-main" onClick={() => navigate("/register")}>
            Create Account →
          </button>
          <button className="btn-cta-sec" onClick={() => navigate("/login")}>
            Already have an account
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-brand">
          © 2025 <strong>ExamPrep</strong> · M. Kumarasamy College of Engineering
        </div>
        <div className="footer-links">
          <span className="footer-link" onClick={() => navigate("/login")}>Sign In</span>
          <span className="footer-link" onClick={() => navigate("/register")}>Register</span>
        </div>
      </footer>
    </div>
  );
}
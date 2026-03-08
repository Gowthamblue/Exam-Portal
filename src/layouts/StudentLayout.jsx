import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NAV = [
  { to: "",           end: true, emoji: "🏠", label: "Dashboard"     },
  { to: "profile",              emoji: "👤", label: "Profile"        },
  { to: "results",              emoji: "📈", label: "My Results"     },
  { to: "assessments",          emoji: "📝", label: "Assessments"    },
  { to: "materials",            emoji: "📚", label: "Materials"      },
  { to: "announcements",        emoji: "📢", label: "Announcements"  },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const [mini, setMini] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const logout = async () => { await signOut(auth); navigate("/"); };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter', system-ui, sans-serif", background:"#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* ── Desktop sidebar ── */
        .sb { background:#0f172a; display:flex; flex-direction:column; flex-shrink:0;
          width:220px; transition:width .22s ease; overflow:hidden; }
        .sb.mini { width:60px; }

        /* ── Mobile: sidebar becomes fixed overlay drawer ── */
        @media(max-width:768px){
          .sb { position:fixed; top:0; left:0; height:100vh; height:100dvh; z-index:200;
            width:240px; transform:translateX(-100%); transition:transform .25s ease; box-shadow:none;
            display:flex; flex-direction:column; }
          .sb.open { transform:translateX(0); box-shadow:4px 0 24px rgba(0,0,0,.35); }
          .sb.mini { width:240px; }
        }

        .sb-overlay { display:none; }
        @media(max-width:768px){
          .sb-overlay { display:block; position:fixed; inset:0; background:rgba(0,0,0,.45);
            z-index:199; opacity:0; pointer-events:none; transition:opacity .25s; }
          .sb-overlay.show { opacity:1; pointer-events:all; }
        }

        .sb-logo { display:flex; align-items:center; gap:10px; padding:0 8px 0 12px;
          height:60px; border-bottom:1px solid #1e293b; flex-shrink:0; overflow:hidden; }
        .sb.mini .sb-logo { padding:0 4px; justify-content:center; gap:0; }
        @media(max-width:768px){ .sb.mini .sb-logo { padding:0 8px 0 12px; justify-content:flex-start; gap:10px; } }

        .sb-logo-mark { width:34px; height:34px; background:linear-gradient(135deg,#3b82f6,#6366f1);
          border-radius:9px; display:flex; align-items:center; justify-content:center;
          color:#fff; font-weight:800; font-size:13px; flex-shrink:0; letter-spacing:-.5px; }
        .sb-logo-text { color:#f1f5f9; font-weight:700; font-size:.92rem;
          white-space:nowrap; opacity:1; transition:opacity .15s; flex:1; }
        .sb.mini .sb-logo-text { opacity:0; pointer-events:none; width:0; }
        @media(max-width:768px){ .sb.mini .sb-logo-text { opacity:1; pointer-events:auto; width:auto; } }

        .sb-toggle { background:none; border:none; cursor:pointer; flex-shrink:0;
          color:#94a3b8; font-size:18px; padding:6px 8px; border-radius:6px; line-height:1; }
        .sb-toggle:hover { background:#1e293b; color:#e2e8f0; }
        /* Hide desktop toggle on mobile — hamburger in topbar handles it */
        @media(max-width:768px){ .sb-toggle { display:none; } }

        .sb-nav { flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; overflow-x:hidden; min-height:0; }
        .sb-nav::-webkit-scrollbar { width:0; }

        .sb-link { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
          text-decoration:none; color:#94a3b8; font-size:.875rem; font-weight:500;
          white-space:nowrap; transition:background .15s, color .15s; position:relative; }
        .sb-link:hover { background:#1e293b; color:#e2e8f0; }
        .sb-link.active { background:#1d4ed8; color:#fff; font-weight:600; }

        .sb-icon { font-size:15px; flex-shrink:0; width:20px; text-align:center; }
        .sb-label { opacity:1; transition:opacity .12s; }
        .sb.mini .sb-label { opacity:0; pointer-events:none; }
        @media(max-width:768px){ .sb.mini .sb-label { opacity:1; pointer-events:auto; } }

        .sb-tip { position:absolute; left:52px; top:50%; transform:translateY(-50%);
          background:#0f172a; color:#f1f5f9; padding:4px 10px; border-radius:6px;
          font-size:.75rem; white-space:nowrap; pointer-events:none;
          box-shadow:0 4px 12px rgba(0,0,0,.4); opacity:0; transition:opacity .1s; z-index:999;
          border:1px solid #1e293b; }
        .sb.mini .sb-link:hover .sb-tip { opacity:1; }
        @media(max-width:768px){ .sb.mini .sb-link:hover .sb-tip { opacity:0; } }

        .sb-footer { padding:10px 8px; border-top:1px solid #1e293b; flex-shrink:0; background:#0f172a; }
        .sb-logout { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
          color:#f87171; font-size:.875rem; font-weight:500; cursor:pointer;
          background:none; border:none; width:100%; text-align:left; white-space:nowrap;
          transition:background .15s; }
        .sb-logout:hover { background:#1e293b; }

        .main-area { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

        .topbar { height:60px; background:#0f172a; border-bottom:1px solid #1e293b;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 20px; flex-shrink:0; }
        .topbar-title { font-size:.88rem; color:#94a3b8; font-weight:500; }
        .topbar-badge { background:rgba(255,255,255,.08); color:#e2e8f0; border:1px solid #1e293b;
          padding:4px 12px; border-radius:20px; font-size:.78rem; font-weight:600; }
        .topbar-ham { display:none; background:none; border:none; cursor:pointer;
          color:#94a3b8; font-size:22px; padding:4px 6px; line-height:1; border-radius:6px; }
        .topbar-ham:hover { background:#1e293b; color:#e2e8f0; }
        @media(max-width:768px){ .topbar-ham { display:flex; align-items:center; } }

        .content { flex:1; overflow-y:auto; padding:24px; }
        @media(max-width:768px){ .content { padding:14px; } }
        .content-card { background:#fff; border-radius:12px; padding:28px;
          box-shadow:0 1px 3px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04);
          min-height:100%; }
        @media(max-width:768px){ .content-card { padding:16px; border-radius:10px; } }

        .content::-webkit-scrollbar { width:5px; }
        .content::-webkit-scrollbar-track { background:transparent; }
        .content::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
      `}</style>

      {/* ── Sidebar ── */}
      <div className="sb-overlay" onClick={closeMobile} style={mobileOpen ? {opacity:1, pointerEvents:"all"} : {}} />
      <aside className={`sb${mini ? " mini" : ""}${mobileOpen ? " open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-mark">EP</div>
          <span className="sb-logo-text">ExamPrep</span>
          <button className="sb-toggle" onClick={() => setMini(m => !m)}
            title={mini ? "Expand sidebar" : "Collapse sidebar"}
            style={{ marginLeft: mini ? "auto" : undefined }}>
            {mini ? "›" : "‹"}
          </button>
        </div>

        <nav className="sb-nav">
          {NAV.map(({ to, end, emoji, label }) => (
            <NavLink key={label} to={to} end={end}
              className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
              onClick={closeMobile}>
              <span className="sb-icon">{emoji}</span>
              <span className="sb-label">{label}</span>
              <span className="sb-tip">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sb-footer">
          <button className="sb-logout" onClick={() => { closeMobile(); logout(); }}>
            <span className="sb-icon">🚪</span>
            <span className="sb-label">Sign Out</span>
            <span className="sb-tip">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-area">
        <header className="topbar">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <button className="topbar-ham" onClick={() => setMobileOpen(o => !o)} title="Menu">☰</button>
            <span className="topbar-title">Student Portal</span>
          </div>
          <span className="topbar-badge">Student</span>
        </header>
        <div className="content">
          <div className="content-card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
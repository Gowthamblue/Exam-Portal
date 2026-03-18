import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const NAV = [
  { to: "students",     emoji: "👤", label: "Students"     },
  { to: "assessments",  emoji: "📝", label: "Assessments"  },
  { to: "ai-generator", emoji: "🤖", label: "AI Generator" },
  { to: "materials",    emoji: "📚", label: "Materials"    },
  { to: "announcements",emoji: "📢", label: "Announcements"},
  { to: "departments",  emoji: "🏛", label: "Departments"  },
  { to: "results",      emoji: "📈", label: "Results"      },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [mini, setMini] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter', system-ui, sans-serif", background:"#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* ── Desktop sidebar ── */
        .asb { background:#02142c; display:flex; flex-direction:column; flex-shrink:0;
          width:220px; transition:width .22s ease; overflow:hidden; }
        .asb.mini { width:60px; }

        /* ── Mobile overlay drawer ── */
        @media(max-width:768px){
          .asb { position:fixed; top:0; left:0; height:100vh; height:100dvh; z-index:200;
            width:240px; transform:translateX(-100%); transition:transform .25s ease;
            display:flex; flex-direction:column; }
          .asb.open { transform:translateX(0); box-shadow:4px 0 24px rgba(0,0,0,.4); }
          .asb.mini { width:240px; }
        }

        .asb-overlay { display:none; }
        @media(max-width:768px){
          .asb-overlay { display:block; position:fixed; inset:0; background:rgba(0,0,0,.45);
            z-index:199; opacity:0; pointer-events:none; transition:opacity .25s; }
          .asb-overlay.show { opacity:1; pointer-events:all; }
        }

        .asb-logo { display:flex; align-items:center; gap:10px; padding:0 8px 0 12px;
          height:60px; border-bottom:1px solid #0d2540; flex-shrink:0; overflow:hidden; }
        .asb.mini .asb-logo { padding:0 4px; justify-content:center; gap:0; }
        @media(max-width:768px){ .asb.mini .asb-logo { padding:0 8px 0 12px; justify-content:flex-start; gap:10px; } }

        .asb-mark { width:34px; height:34px; background:linear-gradient(135deg,#0d6efd,#0ea5e9);
          border-radius:9px; display:flex; align-items:center; justify-content:center;
          color:#fff; font-weight:800; font-size:12px; flex-shrink:0; letter-spacing:-.5px; }

        .asb-name { color:#f1f5f9; font-weight:700; font-size:.92rem;
          white-space:nowrap; opacity:1; transition:opacity .15s; flex:1; }
        .asb.mini .asb-name { opacity:0; pointer-events:none; width:0; }
        @media(max-width:768px){ .asb.mini .asb-name { opacity:1; pointer-events:auto; width:auto; } }

        .asb-toggle { background:none; border:none; cursor:pointer; flex-shrink:0;
          color:#4a6fa5; font-size:18px; padding:6px 8px; border-radius:6px; line-height:1; }
        .asb-toggle:hover { background:#0d2540; color:#e2e8f0; }
        @media(max-width:768px){ .asb-toggle { display:none; } }

        .asb-nav { flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; overflow-x:hidden; min-height:0; }
        .asb-nav::-webkit-scrollbar { width:0; }

        .asb-link { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
          text-decoration:none; color:#7fb3d3; font-size:.875rem; font-weight:500;
          white-space:nowrap; transition:background .15s, color .15s; position:relative; }
        .asb-link:hover { background:#0d2540; color:#e2e8f0; }
        .asb-link.active { background:#0d6efd; color:#fff; font-weight:600; }

        .asb-icon { font-size:15px; flex-shrink:0; width:20px; text-align:center; }
        .asb-label { opacity:1; transition:opacity .12s; }
        .asb.mini .asb-label { opacity:0; pointer-events:none; }
        @media(max-width:768px){ .asb.mini .asb-label { opacity:1; pointer-events:auto; } }

        .asb-tip { position:absolute; left:52px; top:50%; transform:translateY(-50%);
          background:#02142c; color:#f1f5f9; padding:4px 10px; border-radius:6px;
          font-size:.75rem; white-space:nowrap; pointer-events:none;
          box-shadow:0 4px 12px rgba(0,0,0,.4); opacity:0; transition:opacity .1s; z-index:999;
          border:1px solid #0d2540; }
        .asb.mini .asb-link:hover .asb-tip { opacity:1; }
        @media(max-width:768px){ .asb.mini .asb-link:hover .asb-tip { opacity:0; } }

        .asb-footer { padding:10px 8px; border-top:1px solid #0d2540; flex-shrink:0; background:#02142c; }
        .asb-logout { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:8px;
          color:#f87171; font-size:.875rem; font-weight:500; cursor:pointer;
          background:none; border:none; width:100%; text-align:left; white-space:nowrap;
          transition:background .15s; }
        .asb-logout:hover { background:#0d2540; }

        .a-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

        .a-topbar { height:60px; background:#02142c; border-bottom:1px solid #0d2540;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 20px; flex-shrink:0; }
        .a-topbar-left { display:flex; align-items:center; gap:12px; }
        .a-topbar-title { font-size:.88rem; color:#7fb3d3; font-weight:500; }
        .a-topbar-badge { background:rgba(255,255,255,.07); color:#e2e8f0;
          border:1px solid #0d2540; padding:4px 12px; border-radius:20px;
          font-size:.78rem; font-weight:600; }
        .a-topbar-ham { display:none; background:none; border:none; cursor:pointer;
          color:#7fb3d3; font-size:22px; padding:4px 6px; line-height:1; border-radius:6px; }
        .a-topbar-ham:hover { background:#0d2540; color:#e2e8f0; }
        @media(max-width:768px){ .a-topbar-ham { display:flex; align-items:center; } }

        .a-content { flex:1; overflow-y:auto; padding:24px; background:#f0f4f8; }
        @media(max-width:768px){ .a-content { padding:14px; } }
        .a-content-card { background:#fff; border-radius:12px; padding:28px;
          box-shadow:0 1px 3px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04);
          min-height:100%; }
        @media(max-width:768px){ .a-content-card { padding:16px; border-radius:10px; } }

        .a-content::-webkit-scrollbar { width:5px; }
        .a-content::-webkit-scrollbar-track { background:transparent; }
        .a-content::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }
      `}</style>

      {/* ── Sidebar ── */}
      <div className={`asb-overlay${mobileOpen ? " show" : ""}`} onClick={closeMobile} />
      <aside className={`asb${mini ? " mini" : ""}${mobileOpen ? " open" : ""}`}>
        <div className="asb-logo">
          <NavLink to="/admin" end onClick={closeMobile}
            style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flex:1, overflow:"hidden" }}>
            <div className="asb-mark">AP</div>
            <span className="asb-name">Admin Panel</span>
          </NavLink>
          <button className="asb-toggle" onClick={() => setMini(m => !m)}
            title={mini ? "Expand sidebar" : "Collapse sidebar"}
            style={{ marginLeft: mini ? "auto" : undefined }}>
            {mini ? "›" : "‹"}
          </button>
        </div>

        <nav className="asb-nav">
          {NAV.map(({ to, emoji, label }) => (
            <NavLink key={label} to={to}
              className={({ isActive }) => `asb-link${isActive ? " active" : ""}`}
              onClick={closeMobile}>
              <span className="asb-icon">{emoji}</span>
              <span className="asb-label">{label}</span>
              <span className="asb-tip">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="asb-footer">
          <button className="asb-logout" onClick={() => { closeMobile(); handleLogout(); }}>
            <span className="asb-icon">🚪</span>
            <span className="asb-label">Sign Out</span>
            <span className="asb-tip">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="a-main">
        <header className="a-topbar">
          <div className="a-topbar-left">
            <button className="a-topbar-ham" onClick={() => setMobileOpen(o => !o)} title="Menu">☰</button>
            <span className="a-topbar-title">Admin Portal</span>
          </div>
          <span className="a-topbar-badge">Administrator</span>
        </header>
        <div className="a-content">
          <div className="a-content-card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
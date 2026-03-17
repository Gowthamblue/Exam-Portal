import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const handle = async e => {
    e.preventDefault(); setError("");
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) navigate(snap.data().role === "admin" ? "/admin" : "/student");
      else setError("Account not found. Contact your admin.");
    } catch {
      setError("Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", display:"flex",
      alignItems:"center", justifyContent:"center", padding:20,
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        .lc { background:#fff; border-radius:16px; padding:40px 36px; width:100%;
          max-width:380px; box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.08); }
        .lc-input { width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:9px;
          font-size:.9rem; color:#0f172a; outline:none; font-family:inherit; background:#fff;
          transition:border-color .15s,box-shadow .15s; }
        .lc-input:focus { border-color:#1d4ed8; box-shadow:0 0 0 3px rgba(29,78,216,.1); }
        .lc-input::placeholder { color:#94a3b8; }
        .lc-label { display:block; font-size:.78rem; font-weight:600; color:#374151;
          margin-bottom:6px; }
        .lc-pw { position:relative; }
        .lc-pw .lc-input { padding-right:56px; }
        .lc-show { position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#94a3b8; font-size:.78rem; cursor:pointer;
          font-family:inherit; font-weight:500; }
        .lc-show:hover { color:#374151; }
        .lc-btn { width:100%; padding:12px; background:#1d4ed8; border:none; border-radius:9px;
          color:#fff; font-size:.92rem; font-weight:700; cursor:pointer; font-family:inherit;
          transition:background .15s,transform .15s; }
        .lc-btn:hover:not(:disabled) { background:#1e40af; transform:translateY(-1px); }
        .lc-btn:disabled { opacity:.65; cursor:not-allowed; }
        .lc-err { background:#fef2f2; border:1px solid #fecaca; border-radius:8px;
          padding:9px 13px; font-size:.82rem; color:#dc2626; margin-bottom:16px; }
      `}</style>

      <div className="lc">
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:36, height:36, borderRadius:9,
            background:"linear-gradient(135deg,#1d4ed8,#0ea5e9)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontWeight:800, fontSize:13 }}>EP</div>
          <div>
            <div style={{ fontWeight:700, fontSize:".92rem", color:"#0f172a", lineHeight:1.2 }}>ExamPrep</div>
            <div style={{ fontSize:".68rem", color:"#94a3b8" }}>MKCE Student Portal</div>
          </div>
        </div>

        <h2 style={{ fontWeight:700, fontSize:"1.35rem", color:"#0f172a",
          letterSpacing:"-.02em", marginBottom:4 }}>Sign in</h2>
        <p style={{ fontSize:".85rem", color:"#64748b", marginBottom:24 }}>
          New student?{" "}
          <Link to="/register" style={{ color:"#1d4ed8", fontWeight:600, textDecoration:"none" }}>
            Create an account
          </Link>
        </p>

        {error && <div className="lc-err">⚠ {error}</div>}

        <form onSubmit={handle}>
          <div style={{ marginBottom:16 }}>
            <label className="lc-label">Email</label>
            <input className="lc-input" type="email" placeholder="you@mkce.ac.in"
              value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required />
          </div>

          <div style={{ marginBottom:24 }}>
            <label className="lc-label">Password</label>
            <div className="lc-pw">
              <input className="lc-input" type={showPw ? "text" : "password"}
                placeholder="Enter password" value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading} required />
              <button type="button" className="lc-show" onClick={() => setShowPw(s => !s)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="lc-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:20, fontSize:".8rem" }}>
          <Link to="/" style={{ color:"#94a3b8", textDecoration:"none" }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
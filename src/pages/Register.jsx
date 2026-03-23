import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [registerNumber, setRegisterNumber] = useState("");
  const [name,           setName]           = useState("");
  const [department,     setDepartment]     = useState("");
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [confirmPass,    setConfirmPass]    = useState("");
  const [showPw,         setShowPw]         = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [departments,    setDepartments]    = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db,"departments"), orderBy("createdAt","asc")));
        const list = snap.docs.map(d => d.data().name);
        setDepartments(list.length ? list : ["CSE","ECE","MECH"]);
      } catch { setDepartments(["CSE","ECE","MECH"]); }
    })();
  }, []);

  const handle = async e => {
    e.preventDefault(); setError("");
    if (password !== confirmPass) { setError("Passwords do not match."); return; }
    if (password.length < 6)     { setError("Password must be at least 6 characters."); return; }
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db,"users"), where("registerNumber","==",registerNumber)));
      if (!snap.empty) { setError("Register number already exists."); return; }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db,"users",cred.user.uid), {
        registerNumber, name, email, department,
        role:"student", phone:"", address:"", city:"", state:"", pincode:"", createdAt:new Date()
      });
      navigate("/student");
    } catch (err) {
      setError(err.code === "auth/email-already-in-use"
        ? "This email is already registered." : err.message);
    } finally { setLoading(false); }
  };

  const mismatch = confirmPass.length > 0 && password !== confirmPass;

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", display:"flex",
      alignItems:"center", justifyContent:"center", padding:20,
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        .rc { background:#fff; border-radius:16px; padding:40px 36px; width:100%;
          max-width:420px; box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.08); }
        .rc-input { width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:9px;
          font-size:.88rem; color:#0f172a; outline:none; font-family:inherit; background:#fff;
          transition:border-color .15s,box-shadow .15s; }
        .rc-input:focus { border-color:#1d4ed8; box-shadow:0 0 0 3px rgba(29,78,216,.1); }
        .rc-input::placeholder { color:#94a3b8; }
        .rc-input.err { border-color:#fca5a5; }
        .rc-label { display:block; font-size:.78rem; font-weight:600; color:#374151; margin-bottom:6px; }
        .rc-group { margin-bottom:14px; }
        .rc-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .rc-pw { position:relative; }
        .rc-pw .rc-input { padding-right:56px; }
        .rc-show { position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#94a3b8; font-size:.78rem; cursor:pointer;
          font-family:inherit; font-weight:500; }
        .rc-show:hover { color:#374151; }
        .rc-hint { font-size:.72rem; color:#dc2626; margin-top:4px; }
        .rc-err { background:#fef2f2; border:1px solid #fecaca; border-radius:8px;
          padding:9px 13px; font-size:.82rem; color:#dc2626; margin-bottom:16px; }
        .rc-btn { width:100%; padding:12px; background:#1d4ed8; border:none; border-radius:9px;
          color:#fff; font-size:.92rem; font-weight:700; cursor:pointer; font-family:inherit;
          transition:background .15s,transform .15s; margin-top:4px; }
        .rc-btn:hover:not(:disabled) { background:#1e40af; transform:translateY(-1px); }
        .rc-btn:disabled { opacity:.65; cursor:not-allowed; }
        @media(max-width:480px){ .rc-row{grid-template-columns:1fr;gap:0;} }
      `}</style>

      <div className="rc">
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:36, height:36, borderRadius:9,
            background:"linear-gradient(135deg,#1d4ed8,#0ea5e9)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontWeight:800, fontSize:13 }}>CCE</div>
          <div>
            <div style={{ fontWeight:700, fontSize:".92rem", color:"#0f172a", lineHeight:1.2 }}>Centre for Competitive Examinations</div>
            <div style={{ fontSize:".68rem", color:"#94a3b8" }}>MKCE Student Portal</div>
          </div>
        </div>

        <h2 style={{ fontWeight:700, fontSize:"1.35rem", color:"#0f172a",
          letterSpacing:"-.02em", marginBottom:4 }}>Create account</h2>
        <p style={{ fontSize:".85rem", color:"#64748b", marginBottom:24 }}>
          Already registered?{" "}
          <Link to="/login" style={{ color:"#1d4ed8", fontWeight:600, textDecoration:"none" }}>
            Sign in
          </Link>
        </p>

        {error && <div className="rc-err">⚠ {error}</div>}

        <form onSubmit={handle}>

          <div className="rc-row">
            <div className="rc-group">
              <label className="rc-label">Register Number</label>
              <input className="rc-input" placeholder="927622BEC061"
                value={registerNumber}
                onChange={e => { setRegisterNumber(e.target.value.toUpperCase()); setError(""); }}
                required />
            </div>
            <div className="rc-group">
              <label className="rc-label">Department</label>
              <select className="rc-input" value={department}
                onChange={e => { setDepartment(e.target.value); setError(""); }} required>
                <option value="">Select…</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="rc-group">
            <label className="rc-label">Full Name</label>
            <input className="rc-input" placeholder="Your full name"
              value={name} onChange={e => { setName(e.target.value); setError(""); }} required />
          </div>

          <div className="rc-group">
            <label className="rc-label">Email</label>
            <input className="rc-input" type="email" placeholder="you@mkce.ac.in"
              value={email} onChange={e => { setEmail(e.target.value); setError(""); }} required />
          </div>

          <div className="rc-group">
            <label className="rc-label">Password</label>
            <div className="rc-pw">
              <input className="rc-input" type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }} required />
              <button type="button" className="rc-show" onClick={() => setShowPw(s => !s)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="rc-group">
            <label className="rc-label">Confirm Password</label>
            <input className={`rc-input${mismatch ? " err" : ""}`}
              type="password" placeholder="Re-enter password"
              value={confirmPass}
              onChange={e => { setConfirmPass(e.target.value); setError(""); }} required />
            {mismatch && <p className="rc-hint">⚠ Passwords do not match</p>}
          </div>

          <button className="rc-btn" disabled={loading || mismatch}>
            {loading ? "Creating account…" : "Create Account"}
          </button>

        </form>

        <p style={{ textAlign:"center", marginTop:20, fontSize:".8rem" }}>
          <Link to="/" style={{ color:"#94a3b8", textDecoration:"none" }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const PRI = {
  high:   { color:"#dc2626", bg:"#fef2f2", badge:"#fecaca", label:"High",   icon:"🔴", border:"#dc2626" },
  medium: { color:"#d97706", bg:"#fffbeb", badge:"#fde68a", label:"Medium", icon:"🟡", border:"#d97706" },
  normal: { color:"#1d4ed8", bg:"#eff6ff", badge:"#bfdbfe", label:"Normal", icon:"🔵", border:"#1d4ed8" },
};

const fmtDate = ts => {
  if (!ts?.toDate) return "";
  const d=ts.toDate(), now=new Date(), diff=now-d;
  const mins=Math.floor(diff/60000), hrs=Math.floor(mins/60), days=Math.floor(hrs/24);
  if (mins<1) return "Just now"; if (mins<60) return `${mins}m ago`;
  if (hrs<24) return `${hrs}h ago`; if (days===1) return "Yesterday";
  if (days<7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
};

export default function StudentAnnouncements() {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [dept,        setDept]        = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    (async () => {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db,"users",user.uid));
        if (snap.exists()) setDept(snap.data().department);
      }
      const q = query(collection(db,"announcements"), orderBy("createdAt","desc"));
      const rs = await getDocs(q);
      setItems(rs.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    })();
  }, []);

  const relevant = items.filter(a => { const d=a.targetDept||"all"; return d==="all"||d===dept; });
  const filtered = relevant.filter(a =>
    (filter==="all"||a.priority===filter) &&
    (!search.trim()||a.message.toLowerCase().includes(search.toLowerCase()))
  );
  const counts = { high:relevant.filter(a=>a.priority==="high").length,
                   medium:relevant.filter(a=>a.priority==="medium").length,
                   normal:relevant.filter(a=>a.priority==="normal").length };

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading…</p>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h4 style={{ fontWeight:700, margin:0, color:"#0f172a" }}>📢 Announcements</h4>
            {counts.high>0 && <span style={{ background:"#fef2f2", color:"#dc2626", padding:"2px 10px",
              borderRadius:20, fontSize:".72rem", fontWeight:700, border:"1px solid #fecaca",
              animation:"pulse 2s infinite" }}>{counts.high} urgent</span>}
          </div>
          <p style={{ color:"#64748b", fontSize:".85rem", margin:"4px 0 0" }}>
            {relevant.length} announcement{relevant.length!==1?"s":""} for you
            {dept && <span> · {dept} + General</span>}
          </p>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      {/* Urgent banner */}
      {counts.high>0 && filter==="all" && !search && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10,
          padding:"12px 16px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
          <span style={{ fontSize:"1.4rem" }}>⚠️</span>
          <div>
            <p style={{ margin:0, fontWeight:700, color:"#dc2626", fontSize:".9rem" }}>
              {counts.high} urgent announcement{counts.high>1?"s":""} require your attention
            </p>
            <button onClick={()=>setFilter("high")} style={{ background:"none", border:"none",
              color:"#dc2626", fontSize:".8rem", cursor:"pointer", padding:0, textDecoration:"underline" }}>
              View urgent only →
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {relevant.length > 0 && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:20 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{ padding:"7px 12px", border:"1px solid #e2e8f0", borderRadius:8,
              fontSize:".85rem", outline:"none", width:160 }} />
          {["all","high","medium","normal"].map(p => {
            const cfg = p==="all" ? null : PRI[p];
            const cnt = p==="all" ? relevant.length : counts[p];
            if (p!=="all" && cnt===0) return null;
            const active = filter===p;
            return (
              <button key={p} onClick={()=>setFilter(p)} style={{
                padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:".78rem",
                fontWeight: active?700:500,
                background: active ? (cfg?.color||"#1e293b") : "#f1f5f9",
                color: active ? "#fff" : "#374151",
                transition:"all .15s" }}>
                {p==="all" ? `All (${cnt})` : `${cfg.icon} ${cfg.label} (${cnt})`}
              </button>
            );
          })}
          {(search||filter!=="all") && (
            <button onClick={()=>{setSearch(""); setFilter("all");}} style={{
              padding:"5px 14px", borderRadius:20, border:"1px solid #e2e8f0", background:"#fff",
              color:"#64748b", fontSize:".78rem", cursor:"pointer" }}>✕ Clear</button>
          )}
        </div>
      )}

      {/* Empty states */}
      {relevant.length===0 && (
        <div style={{ textAlign:"center", padding:"50px 0", color:"#94a3b8" }}>
          <div style={{ fontSize:"2.5rem" }}>📭</div>
          <h6 style={{ color:"#64748b", marginTop:8 }}>No Announcements Yet</h6>
          <p style={{ fontSize:".85rem" }}>Check back later. Your admin will post updates here.</p>
        </div>
      )}
      {relevant.length>0 && filtered.length===0 && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
          <div style={{ fontSize:"2rem" }}>🔍</div>
          <p>No announcements match your filters.</p>
          <button onClick={()=>{setSearch(""); setFilter("all");}} style={{
            padding:"6px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff",
            cursor:"pointer", fontSize:".85rem" }}>Clear</button>
        </div>
      )}

      {/* List */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(a => {
          const cfg = PRI[a.priority] || PRI.normal;
          const isNew = a.createdAt?.toDate && (new Date()-a.createdAt.toDate()) < 86400000;
          return (
            <div key={a.id} style={{ background:cfg.bg, borderLeft:`4px solid ${cfg.border}`,
              borderRadius:"0 10px 10px 0", border:`1px solid ${cfg.border}18`,
              borderLeftColor:cfg.border, borderLeftWidth:4, padding:"14px 18px",
              boxShadow: a.priority==="high" ? "0 2px 8px rgba(220,38,38,.1)" : "0 1px 3px rgba(0,0,0,.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:6 }}>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ background:cfg.badge, color:cfg.color, padding:"2px 10px",
                    borderRadius:20, fontSize:".72rem", fontWeight:600 }}>{cfg.icon} {cfg.label}</span>
                  {a.targetDept && a.targetDept!=="all"
                    ? <span style={{ background:"#eff6ff", color:"#1d4ed8", padding:"2px 8px",
                        borderRadius:20, fontSize:".72rem", fontWeight:600 }}>{a.targetDept}</span>
                    : <span style={{ background:"#f1f5f9", color:"#64748b", padding:"2px 8px",
                        borderRadius:20, fontSize:".72rem" }}>General</span>}
                  {isNew && <span style={{ background:"#f0fdf4", color:"#16a34a", padding:"2px 8px",
                    borderRadius:20, fontSize:".7rem", fontWeight:600 }}>✨ New</span>}
                </div>
                <span style={{ fontSize:".75rem", color:"#94a3b8", whiteSpace:"nowrap" }}>🕐 {fmtDate(a.createdAt)}</span>
              </div>
              <p style={{ margin:0, fontWeight:600, color: a.priority==="high"?"#991b1b":"#1e293b",
                fontSize:".9rem", lineHeight:1.6 }}>{a.message}</p>
              {a.createdAt?.toDate && (
                <p style={{ margin:"6px 0 0", fontSize:".72rem", color:"#94a3b8" }}>
                  {a.createdAt.toDate().toLocaleString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length>0 && (
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:".78rem", marginTop:20 }}>
          Showing {filtered.length} of {relevant.length}
        </p>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const TYPE = (link="") => {
  const l = link.toLowerCase();
  if (l.includes("youtube.com")||l.includes("youtu.be")) return { icon:"▶",  label:"Video",  color:"#dc2626", bg:"#fef2f2" };
  if (l.endsWith(".pdf")||l.includes("pdf"))              return { icon:"📄", label:"PDF",    color:"#ea580c", bg:"#fff7ed" };
  if (l.includes("drive.google.com"))                     return { icon:"📁", label:"Drive",  color:"#1d4ed8", bg:"#eff6ff" };
  if (l.includes("docs.google.com"))                      return { icon:"📝", label:"Doc",    color:"#16a34a", bg:"#f0fdf4" };
  if (l.includes("github.com"))                           return { icon:"💻", label:"Code",   color:"#1e293b", bg:"#f8fafc" };
  if (l.includes("slides")||l.includes("ppt"))            return { icon:"📊", label:"Slides", color:"#d97706", bg:"#fffbeb" };
  return                                                         { icon:"🔗", label:"Link",   color:"#6366f1", bg:"#f5f3ff" };
};

const fmtDate = ts => {
  if (!ts?.toDate) return "–";
  const d=ts.toDate(), now=new Date(), diff=Math.floor((now-d)/86400000);
  if (diff===0) return "Today"; if (diff===1) return "Yesterday";
  if (diff<7)  return `${diff} days ago`;
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
};

export default function StudentMaterials() {
  const [materials,   setMaterials]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [department,  setDepartment]  = useState("");
  const [search,      setSearch]      = useState("");
  const [sortBy,      setSortBy]      = useState("newest");

  useEffect(() => {
    (async () => {
      const user = auth.currentUser; if (!user) return;
      const snap = await getDoc(doc(db,"users",user.uid));
      const dept = snap.data().department; setDepartment(dept);
      const rs   = await getDocs(query(collection(db,"materials"), where("department","==",dept)));
      setMaterials(rs.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    })();
  }, []);

  const list = [...materials]
    .filter(m => !search.trim() || m.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==="newest") return (b.createdAt?.toDate?.()|| 0)-(a.createdAt?.toDate?.()|| 0);
      if (sortBy==="oldest") return (a.createdAt?.toDate?.()|| 0)-(b.createdAt?.toDate?.()|| 0);
      return (a.description||"").localeCompare(b.description||"");
    });

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading materials…</p>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h4 style={{ fontWeight:700, margin:0, color:"#0f172a" }}>📚 Study Materials</h4>
          <p style={{ color:"#64748b", fontSize:".85rem", margin:"4px 0 0" }}>
            {materials.length} material{materials.length!==1?"s":""} for <strong>{department}</strong>
          </p>
        </div>
        {materials.length > 0 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              style={{ padding:"7px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:".85rem",
                outline:"none", width:180 }} />
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              style={{ padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:".85rem",
                outline:"none", background:"#fff" }}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A → Z</option>
            </select>
            {search && <button onClick={()=>setSearch("")} style={{ padding:"6px 12px", border:"1px solid #e2e8f0",
              borderRadius:8, background:"#fff", fontSize:".8rem", cursor:"pointer", color:"#64748b" }}>✕ Clear</button>}
          </div>
        )}
      </div>

      {materials.length === 0 && (
        <div style={{ textAlign:"center", padding:"50px 0", color:"#94a3b8" }}>
          <div style={{ fontSize:"2.5rem" }}>📭</div>
          <h6 style={{ color:"#64748b", marginTop:8 }}>No Materials Yet</h6>
          <p style={{ fontSize:".85rem" }}>Your admin hasn't uploaded any materials for {department} yet.</p>
        </div>
      )}

      {materials.length > 0 && list.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
          <div style={{ fontSize:"2rem" }}>🔍</div>
          <p>No materials match "<strong>{search}</strong>"</p>
          <button onClick={()=>setSearch("")} style={{ padding:"6px 16px", border:"1px solid #e2e8f0",
            borderRadius:8, background:"#fff", cursor:"pointer", fontSize:".85rem" }}>Clear</button>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14 }}>
        {list.map((m,idx) => {
          const t = TYPE(m.link);
          const isNew = m.createdAt?.toDate && (new Date()-m.createdAt.toDate()) < 86400000*3;
          return (
            <div key={m.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10,
              padding:"16px", boxShadow:"0 1px 3px rgba(0,0,0,.04)",
              transition:"box-shadow .2s, transform .2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.1)";
                e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)";
                e.currentTarget.style.transform="translateY(0)"; }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:44, height:44, background:t.bg, border:`1px solid ${t.color}20`,
                  borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.3rem", flexShrink:0 }}>{t.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ background:t.bg, color:t.color, padding:"2px 8px", borderRadius:20,
                      fontSize:".7rem", fontWeight:600, border:`1px solid ${t.color}30` }}>{t.label}</span>
                    {isNew && <span style={{ background:"#f0fdf4", color:"#16a34a", padding:"2px 8px",
                      borderRadius:20, fontSize:".7rem", fontWeight:600 }}>✨ New</span>}
                  </div>
                  <p style={{ margin:0, fontWeight:600, color:"#1e293b", fontSize:".9rem", lineHeight:1.4,
                    overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2,
                    WebkitBoxOrient:"vertical" }}>{m.description}</p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    marginTop:10, flexWrap:"wrap", gap:8 }}>
                    <span style={{ fontSize:".75rem", color:"#94a3b8" }}>🕐 {fmtDate(m.createdAt)}</span>
                    <a href={m.link} target="_blank" rel="noreferrer" style={{
                      background:t.color, color:"#fff", padding:"4px 14px", borderRadius:8,
                      fontSize:".78rem", fontWeight:600, textDecoration:"none", display:"inline-block" }}>
                      Open {t.label} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {list.length > 0 && (
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:".78rem", marginTop:20 }}>
          Showing {list.length} of {materials.length}
        </p>
      )}
    </div>
  );
}
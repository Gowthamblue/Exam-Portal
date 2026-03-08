import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function MyResults() {
  const [results,        setResults]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [registerNumber, setRegisterNumber] = useState("");

  useEffect(() => {
    (async () => {
      const user = auth.currentUser; if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid)); if (!snap.exists()) return;
      const reg = snap.data().registerNumber; setRegisterNumber(reg);
      const rs = await getDocs(query(collection(db,"results"), where("registerNumber","==",reg)));
      const arr = rs.docs.map(d => ({ id:d.id, ...d.data() }));
      arr.sort((a,b) => (b.submittedAt?.toDate?.() || 0) - (a.submittedAt?.toDate?.() || 0));
      setResults(arr); setLoading(false);
    })();
  }, []);

  const total = results.length;
  const avg   = total ? Math.round(results.reduce((s,r) => s+r.percentage,0)/total) : 0;
  const best  = total ? Math.max(...results.map(r => r.percentage)) : 0;

  const badge = p => p>=80
    ? { bg:"#f0fdf4", color:"#16a34a", label:"Excellent" }
    : p>=50
    ? { bg:"#fffbeb", color:"#d97706", label:"Good" }
    : { bg:"#fef2f2", color:"#dc2626", label:"Needs Work" };

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading results…</p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h4 style={{ fontWeight:700, margin:0, color:"#0f172a" }}>My Results</h4>
        <p style={{ color:"#64748b", fontSize:".85rem", margin:"4px 0 0" }}>Reg. No: <strong>{registerNumber}</strong></p>
      </div>

      {/* Summary */}
      {total > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Total Tests",    value:total,    icon:"📝", color:"#1d4ed8", bg:"#eff6ff" },
            { label:"Average Score",  value:`${avg}%`, icon:"📊", color:"#7c3aed", bg:"#f5f3ff" },
            { label:"Best Score",     value:`${best}%`,icon:"🏆", color:"#16a34a", bg:"#f0fdf4" },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}20`, borderRadius:10, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:"1.3rem" }}>{s.icon}</div>
              <div style={{ fontSize:"1.5rem", fontWeight:700, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:".78rem", color:"#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {results.length === 0 ? (
        <div style={{ textAlign:"center", padding:"50px 0", background:"#f8fafc", borderRadius:10 }}>
          <div style={{ fontSize:"2.5rem" }}>📋</div>
          <h6 style={{ color:"#64748b", marginTop:8 }}>No Results Yet</h6>
          <p style={{ color:"#94a3b8", fontSize:".85rem" }}>Your scores will appear here after submitting assessments.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {results.map((r,i) => {
            const b = badge(r.percentage);
            return (
              <div key={r.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10,
                padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center",
                boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
                <div>
                  <p style={{ margin:0, fontWeight:600, color:"#1e293b" }}>{r.assessmentTitle}</p>
                  <p style={{ margin:"4px 0 0", fontSize:".8rem", color:"#64748b" }}>
                    Score: {r.score} / {r.totalMarks} &nbsp;·&nbsp;
                    {r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                  </p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"1.4rem", fontWeight:700, color:b.color }}>{r.percentage}%</div>
                  <span style={{ background:b.bg, color:b.color, padding:"2px 10px", borderRadius:20, fontSize:".75rem", fontWeight:600 }}>{b.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
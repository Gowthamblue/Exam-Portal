import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [results, setResults]  = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      const user = auth.currentUser; if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;
      const data = snap.data(); setStudent(data);
      const q = query(collection(db, "results"), where("registerNumber", "==", data.registerNumber));
      const rs = await getDocs(q);
      const arr = rs.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a,b) => (b.submittedAt?.toDate?.() || 0) - (a.submittedAt?.toDate?.() || 0));
      setResults(arr); setLoading(false);
    })();
  }, []);

  const total   = results.length;
  const avg     = total ? Math.round(results.reduce((s,r) => s + r.percentage, 0) / total) : 0;
  const best    = total ? Math.max(...results.map(r => r.percentage)) : 0;
  const latest  = total ? results[0].percentage : null;

  const rec = !total
    ? { text:"No assessments attempted yet. Start with your first test!", icon:"📋", c:"#64748b" }
    : avg < 50
    ? { text:"Your performance needs improvement. Revisit study materials and attempt practice tests.", icon:"📖", c:"#dc2626" }
    : avg <= 80
    ? { text:"Good progress! Keep practicing mock tests to push your score higher.", icon:"💪", c:"#d97706" }
    : { text:"Excellent performance! You're on track. Try advanced assessments to challenge yourself.", icon:"🏆", c:"#16a34a" };

  const badgeColor = p => p >= 80 ? "#16a34a" : p >= 50 ? "#d97706" : "#dc2626";

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading dashboard…</p>
    </div>
  );

  return (
    <div>
      {/* Welcome */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1d4ed8)", borderRadius:12, padding:"24px 28px", marginBottom:24, color:"#fff" }}>
        <h4 style={{ margin:0, fontWeight:700 }}>👋 Welcome back, {student?.name}</h4>
        <p style={{ margin:"6px 0 0", opacity:.7, fontSize:".88rem" }}>
          {student?.department} Department &nbsp;·&nbsp; {student?.registerNumber}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Tests Attempted", value:total,                               icon:"📝", color:"#1d4ed8", bg:"#eff6ff" },
          { label:"Average Score",   value:total ? `${avg}%`    : "—",          icon:"📊", color:"#7c3aed", bg:"#f5f3ff" },
          { label:"Best Score",      value:total ? `${best}%`   : "—",          icon:"🏆", color:"#16a34a", bg:"#f0fdf4" },
          { label:"Latest Score",    value:latest !== null ? `${latest}%` : "—",icon:"🕐", color:"#ea580c", bg:"#fff7ed" },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}20`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontSize:"1.4rem" }}>{s.icon}</div>
            <div style={{ fontSize:"1.6rem", fontWeight:700, color:s.color, lineHeight:1.2, marginTop:4 }}>{s.value}</div>
            <div style={{ fontSize:".78rem", color:"#64748b", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{ background:"#f8fafc", borderLeft:"4px solid #1d4ed8", borderRadius:"0 8px 8px 0", padding:"12px 16px", marginBottom:24 }}>
        <p style={{ margin:0, fontSize:".9rem", color:rec.c, fontWeight:500 }}>{rec.icon} &nbsp;{rec.text}</p>
      </div>

      {/* Recent results */}
      <p style={{ fontWeight:600, fontSize:".9rem", color:"#374151", marginBottom:12 }}>Recent Results</p>
      {results.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
          <div style={{ fontSize:"2.5rem" }}>📋</div>
          <p style={{ marginTop:8 }}>No results yet. Attempt an assessment to see your performance here.</p>
        </div>
      ) : (
        <div style={{ borderRadius:10, border:"1px solid #e2e8f0", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".875rem" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["#","Assessment","Score","Total","Percentage","Date"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:600, color:"#374151",
                    borderBottom:"1px solid #e2e8f0", fontSize:".8rem", textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r,i) => (
                <tr key={r.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                  <td style={{ padding:"10px 14px", color:"#94a3b8", fontSize:".8rem" }}>{i+1}</td>
                  <td style={{ padding:"10px 14px", fontWeight:500, color:"#1e293b" }}>{r.assessmentTitle}</td>
                  <td style={{ padding:"10px 14px", color:"#374151" }}>{r.score}</td>
                  <td style={{ padding:"10px 14px", color:"#374151" }}>{r.totalMarks}</td>
                  <td style={{ padding:"10px 14px" }}>
                    <span style={{ background:`${badgeColor(r.percentage)}18`, color:badgeColor(r.percentage),
                      padding:"3px 10px", borderRadius:20, fontWeight:600, fontSize:".8rem" }}>{r.percentage}%</span>
                  </td>
                  <td style={{ padding:"10px 14px", color:"#64748b", fontSize:".82rem" }}>
                    {r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
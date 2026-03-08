import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StudentAssessments() {
  const [aiAssessments,   setAiAssessments]   = useState([]);
  const [formAssessments, setFormAssessments] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [tab,             setTab]             = useState("ai");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const user = auth.currentUser; if (!user) return;
      const snap = await getDoc(doc(db,"users",user.uid));
      const dept = snap.data().department;
      const [aiSnap, formSnap] = await Promise.all([
        getDocs(query(collection(db,"aiAssessments"), where("department","==",dept))),
        getDocs(query(collection(db,"assessments"),   where("department","==",dept))),
      ]);
      const ai = aiSnap.docs.map(d=>({id:d.id,...d.data()}));
      ai.sort((a,b)=>(b.createdAt?.toDate?.()|| 0)-(a.createdAt?.toDate?.()|| 0));
      setAiAssessments(ai);
      setFormAssessments(formSnap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    })();
  }, []);

  const expired = d => new Date() > new Date(d);

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading assessments…</p>
    </div>
  );

  return (
    <div>
      <h4 style={{ fontWeight:700, margin:"0 0 4px", color:"#0f172a" }}>Assessments</h4>
      <p style={{ color:"#64748b", fontSize:".85rem", marginBottom:20 }}>
        Attempt in-app AI tests or open external Google Form assessments.
      </p>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"2px solid #e2e8f0", marginBottom:24, gap:4 }}>
        {[
          { key:"ai",   label:"🤖 AI Assessments",    count:aiAssessments.length   },
          { key:"form", label:"📋 Google Form Tests",  count:formAssessments.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            border:"none", background:"none", padding:"10px 18px", cursor:"pointer", fontSize:".875rem",
            fontWeight: tab===t.key ? 700 : 500, color: tab===t.key ? "#1d4ed8" : "#64748b",
            borderBottom: tab===t.key ? "2px solid #1d4ed8" : "2px solid transparent",
            marginBottom:"-2px", borderRadius:"4px 4px 0 0", transition:"all .15s",
          }}>
            {t.label}
            <span style={{ marginLeft:8, background: tab===t.key ? "#1d4ed8" : "#e2e8f0",
              color: tab===t.key ? "#fff" : "#64748b", padding:"2px 8px", borderRadius:20, fontSize:".72rem", fontWeight:600 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* AI Tab */}
      {tab === "ai" && (
        aiAssessments.length === 0
          ? <div style={{ textAlign:"center", padding:"50px 0", color:"#94a3b8" }}><div style={{ fontSize:"2.5rem" }}>🤖</div><p>No AI assessments available for your department yet.</p></div>
          : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {aiAssessments.map(a => {
                const exp = expired(a.lastDate);
                return (
                  <div key={a.id} style={{ background: exp?"#f8fafc":"#fff", border:"1px solid #e2e8f0",
                    borderRadius:10, padding:"16px 20px", display:"flex", justifyContent:"space-between",
                    alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,.04)", opacity: exp?.7:1 }}>
                    <div>
                      <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                        <span style={{ background:"#f5f3ff", color:"#7c3aed", padding:"2px 10px",
                          borderRadius:20, fontSize:".72rem", fontWeight:600 }}>🤖 AI Generated</span>
                        {exp && <span style={{ background:"#fef2f2", color:"#dc2626", padding:"2px 10px",
                          borderRadius:20, fontSize:".72rem", fontWeight:600 }}>Expired</span>}
                      </div>
                      <p style={{ margin:0, fontWeight:600, color:"#1e293b" }}>{a.title}</p>
                      <p style={{ margin:"4px 0 0", fontSize:".8rem", color:"#64748b" }}>
                        {a.questionCount} Questions &nbsp;·&nbsp; {a.questionCount*2} min &nbsp;·&nbsp; Due: {a.lastDate}
                      </p>
                    </div>
                    {exp
                      ? <span style={{ background:"#f1f5f9", color:"#94a3b8", padding:"6px 16px",
                          borderRadius:8, fontSize:".8rem", fontWeight:600 }}>Closed</span>
                      : <button onClick={() => navigate(`/student/attempt/${a.id}`)} style={{
                          background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", color:"#fff",
                          border:"none", borderRadius:8, padding:"8px 20px", fontWeight:600,
                          fontSize:".85rem", cursor:"pointer" }}>
                          Start →
                        </button>
                    }
                  </div>
                );
              })}
            </div>
      )}

      {/* Form Tab */}
      {tab === "form" && (
        formAssessments.length === 0
          ? <div style={{ textAlign:"center", padding:"50px 0", color:"#94a3b8" }}><div style={{ fontSize:"2.5rem" }}>📋</div><p>No Google Form assessments available yet.</p></div>
          : <div style={{ borderRadius:10, border:"1px solid #e2e8f0", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".875rem" }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["#","Title","Last Date","Action"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:600,
                        color:"#374151", borderBottom:"1px solid #e2e8f0", fontSize:".78rem",
                        textTransform:"uppercase", letterSpacing:".04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formAssessments.map((a,i) => (
                    <tr key={a.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <td style={{ padding:"10px 14px", color:"#94a3b8", fontSize:".8rem" }}>{i+1}</td>
                      <td style={{ padding:"10px 14px", fontWeight:500, color:"#1e293b" }}>{a.title}</td>
                      <td style={{ padding:"10px 14px", color:"#64748b" }}>{a.lastDate}</td>
                      <td style={{ padding:"10px 14px" }}>
                        {expired(a.lastDate)
                          ? <span style={{ background:"#fef2f2", color:"#dc2626", padding:"3px 10px",
                              borderRadius:20, fontSize:".75rem", fontWeight:600 }}>Closed</span>
                          : <a href={a.formLink} target="_blank" rel="noreferrer" style={{
                              background:"#f0fdf4", color:"#16a34a", padding:"4px 14px", borderRadius:8,
                              fontSize:".8rem", fontWeight:600, textDecoration:"none",
                              border:"1px solid #bbf7d0", display:"inline-block" }}>
                              Open Form ↗
                            </a>
                        }
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
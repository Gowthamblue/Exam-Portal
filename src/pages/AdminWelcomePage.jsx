import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AdminWelcomePage() {
  const [stats,   setStats]   = useState({ students:0, assessments:0, materials:0, results:0 });
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [usersSnap, aiSnap, formSnap, matsSnap, resultsSnap, recentSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "aiAssessments")),
          getDocs(collection(db, "assessments")),
          getDocs(collection(db, "materials")),
          getDocs(collection(db, "results")),
          getDocs(query(collection(db, "results"), orderBy("submittedAt", "desc"), limit(5))),
        ]);

        const students = usersSnap.docs.filter(d => d.data().role === "student").length;

        setStats({
          students,
          assessments: aiSnap.size + formSnap.size,
          materials:   matsSnap.size,
          results:     resultsSnap.size,
        });

        setRecent(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmtDate = ts => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  };

  const badgeColor = p => p >= 80
    ? { bg:"#f0fdf4", color:"#16a34a" }
    : p >= 50
    ? { bg:"#fffbeb", color:"#d97706" }
    : { bg:"#fef2f2", color:"#dc2626" };

  const quickLinks = [
    { icon:"👤", label:"Manage Students",    to:"students",     color:"#1d4ed8", bg:"#eff6ff" },
    { icon:"📝", label:"Assessments",        to:"assessments",  color:"#7c3aed", bg:"#f5f3ff" },
    { icon:"🤖", label:"AI Generator",       to:"ai-generator", color:"#0891b2", bg:"#ecfeff" },
    { icon:"📚", label:"Study Materials",    to:"materials",    color:"#16a34a", bg:"#f0fdf4" },
    { icon:"📢", label:"Announcements",      to:"announcements",color:"#ea580c", bg:"#fff7ed" },
    { icon:"🏛", label:"Departments",        to:"departments",  color:"#64748b", bg:"#f8fafc" },
  ];

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" />
      <p className="mt-3 text-muted" style={{ fontSize:".88rem" }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#02142c,#0d3a6e)", borderRadius:12,
        padding:"24px 28px", marginBottom:24, color:"#fff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div>
            <h4 style={{ margin:0, fontWeight:700, fontSize:"1.2rem" }}>👋 Welcome, Admin</h4>
            <p style={{ margin:"6px 0 0", opacity:.65, fontSize:".85rem" }}>
              M. Kumarasamy College of Engineering &nbsp;·&nbsp; Admin Panel
            </p>
          </div>
          <div style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)",
            borderRadius:8, padding:"6px 14px", fontSize:".78rem", color:"rgba(255,255,255,.8)", fontWeight:500 }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          { label:"Total Students",  value:stats.students,    icon:"👤", color:"#1d4ed8", bg:"#eff6ff" },
          { label:"Assessments",     value:stats.assessments, icon:"📝", color:"#7c3aed", bg:"#f5f3ff" },
          { label:"Study Materials", value:stats.materials,   icon:"📚", color:"#16a34a", bg:"#f0fdf4" },
          { label:"Total Attempts",  value:stats.results,     icon:"📊", color:"#ea580c", bg:"#fff7ed" },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}18`,
            borderRadius:10, padding:"18px 16px" }}>
            <div style={{ fontSize:"1.5rem" }}>{s.icon}</div>
            <div style={{ fontSize:"1.8rem", fontWeight:700, color:s.color, lineHeight:1.1, marginTop:6 }}>
              {s.value}
            </div>
            <div style={{ fontSize:".75rem", color:"#64748b", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links + Recent results */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* Quick Links */}
        <div>
          <p style={{ fontWeight:600, fontSize:".88rem", color:"#374151",
            marginBottom:12, textTransform:"uppercase", letterSpacing:".05em" }}>Quick Access</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {quickLinks.map(q => (
              <button key={q.label} onClick={() => navigate(q.to)}
                style={{ background:q.bg, border:`1px solid ${q.color}18`, borderRadius:10,
                  padding:"14px 12px", cursor:"pointer", textAlign:"left",
                  transition:"transform .15s, box-shadow .15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)";
                  e.currentTarget.style.boxShadow=`0 4px 12px ${q.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ fontSize:"1.3rem", marginBottom:6 }}>{q.icon}</div>
                <div style={{ fontSize:".82rem", fontWeight:600, color:q.color }}>{q.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Attempts */}
        <div>
          <p style={{ fontWeight:600, fontSize:".88rem", color:"#374151",
            marginBottom:12, textTransform:"uppercase", letterSpacing:".05em" }}>Recent Attempts</p>
          {recent.length === 0 ? (
            <div style={{ background:"#f8fafc", borderRadius:10, padding:"32px 16px",
              textAlign:"center", color:"#94a3b8", fontSize:".85rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>📋</div>
              No assessment attempts yet
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {recent.map(r => {
                const b = badgeColor(r.percentage);
                return (
                  <div key={r.id} style={{ background:"#fff", border:"1px solid #e2e8f0",
                    borderRadius:10, padding:"11px 14px", display:"flex",
                    justifyContent:"space-between", alignItems:"center",
                    boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
                    <div>
                      <p style={{ margin:0, fontWeight:600, fontSize:".85rem", color:"#1e293b" }}>
                        {r.studentName || r.registerNumber}
                      </p>
                      <p style={{ margin:"2px 0 0", fontSize:".75rem", color:"#94a3b8" }}>
                        {r.assessmentTitle} &nbsp;·&nbsp; {fmtDate(r.submittedAt)}
                      </p>
                    </div>
                    <span style={{ background:b.bg, color:b.color, padding:"3px 10px",
                      borderRadius:20, fontWeight:700, fontSize:".78rem", flexShrink:0 }}>
                      {r.percentage}%
                    </span>
                  </div>
                );
              })}
              <button onClick={() => navigate("students")}
                style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:8,
                  padding:"8px", fontSize:".8rem", color:"#64748b", cursor:"pointer",
                  marginTop:2 }}>
                View all students →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useDepartments } from "../../hooks/useDepartments";

// ── helpers ──────────────────────────────────────────────────────────────────
const badgeStyle = (pct) => {
  if (pct >= 80) return { bg:"#f0fdf4", color:"#16a34a", label:"Excellent" };
  if (pct >= 50) return { bg:"#fffbeb", color:"#d97706", label:"Good" };
  return               { bg:"#fef2f2", color:"#dc2626", label:"Needs Work" };
};

const fmtDate = (ts) => {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
};

// ── Excel export via SheetJS (lazy loaded) ────────────────────────────────────
const downloadExcel = async (assessmentTitle, dept, rows) => {
  if (!window.XLSX) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const XLSX = window.XLSX;

  const wsData = [
    [`Assessment Report: ${assessmentTitle}`],
    [`Department: ${dept}`],
    [`Generated on: ${new Date().toLocaleString("en-IN")}`],
    [`Total Attempted: ${rows.length}`],
    [],
    ["#", "Register Number", "Student Name", "Score", "Total Marks", "Percentage", "Grade", "Submitted Date"],
    ...rows.map((r, i) => [
      i + 1,
      r.registerNumber || "—",
      r.studentName    || "—",
      r.score,
      r.totalMarks,
      `${r.percentage}%`,
      r.percentage >= 80 ? "Excellent" : r.percentage >= 50 ? "Good" : "Needs Work",
      fmtDate(r.submittedAt),
    ]),
    [],
    ["Summary Statistics"],
    ["Total Attempted", rows.length],
    ["Average Score",   rows.length ? (rows.reduce((s,r)=>s+r.percentage,0)/rows.length).toFixed(1)+"%" : "—"],
    ["Highest Score",   rows.length ? Math.max(...rows.map(r=>r.percentage))+"%" : "—"],
    ["Lowest Score",    rows.length ? Math.min(...rows.map(r=>r.percentage))+"%" : "—"],
    ["Passed (≥50%)",   rows.filter(r=>r.percentage>=50).length],
    ["Failed (<50%)",   rows.filter(r=>r.percentage<50).length],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch:4 },{ wch:18 },{ wch:24 },{ wch:8 },
    { wch:12 },{ wch:12 },{ wch:14 },{ wch:18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  const safe = assessmentTitle.replace(/[^a-z0-9]/gi,"_").slice(0,40);
  XLSX.writeFile(wb, `${safe}_Results.xlsx`);
};

// ════════════════════════════════════════════════════════════════════════════
export default function AdminResultsPage() {
  const { departments }                       = useDepartments();
  const [selectedDept,   setSelectedDept]     = useState(null);
  const [assessments,    setAssessments]      = useState([]);
  const [loadingAssess,  setLoadingAssess]    = useState(false);
  const [selectedAssess, setSelectedAssess]   = useState(null);
  const [results,        setResults]          = useState([]);
  const [loadingResults, setLoadingResults]   = useState(false);
  const [search,         setSearch]           = useState("");
  const [downloading,    setDownloading]      = useState(false);

  // fetch assessments when dept changes
  useEffect(() => {
    if (!selectedDept) return;
    setAssessments([]); setSelectedAssess(null); setResults([]);
    setLoadingAssess(true);
    (async () => {
      const [aiSnap, formSnap] = await Promise.all([
        getDocs(query(collection(db,"aiAssessments"), where("department","==",selectedDept))),
        getDocs(query(collection(db,"assessments"),   where("department","==",selectedDept))),
      ]);
      const ai   = aiSnap.docs.map(d => ({ id:d.id, type:"AI",   ...d.data() }));
      const form = formSnap.docs.map(d => ({ id:d.id, type:"Form", ...d.data() }));
      const all  = [...ai, ...form].sort((a,b) =>
        (b.createdAt?.toDate?.()|| 0) - (a.createdAt?.toDate?.()|| 0)
      );
      setAssessments(all);
      setLoadingAssess(false);
    })();
  }, [selectedDept]);

  // fetch results when assessment changes
  useEffect(() => {
    if (!selectedAssess) return;
    setResults([]); setLoadingResults(true); setSearch("");
    (async () => {
      const snap = await getDocs(
        query(collection(db,"results"), where("assessmentId","==",selectedAssess.id))
      );
      const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      data.sort((a,b) => b.percentage - a.percentage);
      setResults(data);
      setLoadingResults(false);
    })();
  }, [selectedAssess]);

  const filtered = results.filter(r =>
    !search.trim() ||
    r.registerNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  const total   = results.length;
  const avg     = total ? (results.reduce((s,r)=>s+r.percentage,0)/total).toFixed(1) : "—";
  const highest = total ? Math.max(...results.map(r=>r.percentage)) : "—";
  const passed  = results.filter(r=>r.percentage>=50).length;

  const handleDownload = async () => {
    if (!results.length) return;
    setDownloading(true);
    try { await downloadExcel(selectedAssess.title, selectedDept, results); }
    finally { setDownloading(false); }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom:24 }}>
        <h4 style={{ fontWeight:700, margin:0, color:"#0f172a" }}>Assessment Results</h4>
        <p style={{ color:"#64748b", fontSize:".85rem", margin:"4px 0 0" }}>
          Select a department → choose an assessment → view &amp; download results
        </p>
      </div>

      {/* ── Dept tabs ── */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
        {departments.map(d => (
          <button key={d}
            onClick={() => { setSelectedDept(d); setSelectedAssess(null); }}
            style={{
              padding:"8px 22px", borderRadius:8, fontWeight:600, fontSize:".875rem",
              cursor:"pointer", transition:"all .15s", border:"none", fontFamily:"inherit",
              background: selectedDept===d ? "#02142c" : "#f1f5f9",
              color:       selectedDept===d ? "#fff"     : "#374151",
              boxShadow:   selectedDept===d ? "0 2px 8px rgba(2,20,44,.25)" : "none",
            }}>
            {d}
          </button>
        ))}
      </div>

      {!selectedDept && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8",
          background:"#f8fafc", borderRadius:12 }}>
          <div style={{ fontSize:"3rem" }}>🏛</div>
          <p style={{ marginTop:8, fontSize:".9rem" }}>Select a department above to get started</p>
        </div>
      )}

      {/* ── Two column: Assessment list | Results ── */}
      {selectedDept && (
        <div style={{ display:"grid",
          gridTemplateColumns: selectedAssess ? "280px 1fr" : "1fr",
          gap:20, alignItems:"start" }}>

          {/* Assessment list */}
          <div>
            <p style={{ fontWeight:700, fontSize:".75rem", color:"#64748b",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
              {selectedDept} · {assessments.length} Assessment{assessments.length!==1?"s":""}
            </p>

            {loadingAssess ? (
              <div style={{ textAlign:"center", padding:"24px" }}>
                <div className="spinner-border spinner-border-sm text-primary" />
              </div>
            ) : assessments.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 16px", background:"#f8fafc",
                borderRadius:10, color:"#94a3b8", fontSize:".85rem" }}>
                No assessments found for {selectedDept}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {assessments.map(a => {
                  const active = selectedAssess?.id === a.id;
                  return (
                    <div key={a.id} onClick={() => setSelectedAssess(a)}
                      style={{
                        background: active ? "#02142c" : "#fff",
                        border:     active ? "2px solid #02142c" : "1px solid #e2e8f0",
                        borderRadius:10, padding:"12px 14px", cursor:"pointer",
                        transition:"all .15s",
                        boxShadow: active ? "0 4px 16px rgba(2,20,44,.3)" : "0 1px 3px rgba(0,0,0,.04)",
                      }}>
                      <div style={{ display:"flex", gap:6, marginBottom:5 }}>
                        <span style={{
                          padding:"2px 8px", borderRadius:20, fontSize:".68rem", fontWeight:700,
                          background: active ? "rgba(255,255,255,.15)" : a.type==="AI" ? "#f5f3ff" : "#eff6ff",
                          color:      active ? "#fff" : a.type==="AI" ? "#7c3aed" : "#1d4ed8",
                        }}>
                          {a.type==="AI" ? "🤖 AI" : "📋 Form"}
                        </span>
                      </div>
                      <p style={{
                        margin:0, fontWeight:600, fontSize:".86rem", lineHeight:1.4,
                        color: active ? "#fff" : "#1e293b",
                        overflow:"hidden", display:"-webkit-box",
                        WebkitLineClamp:2, WebkitBoxOrient:"vertical",
                      }}>
                        {a.title}
                      </p>
                      <p style={{ margin:"5px 0 0", fontSize:".72rem",
                        color: active ? "rgba(255,255,255,.5)" : "#94a3b8" }}>
                        Due: {a.lastDate || "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results panel */}
          {selectedAssess && (
            <div>

              {/* Result header */}
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:18 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:".72rem", color:"#64748b",
                    textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 4px" }}>
                    Viewing Results
                  </p>
                  <h5 style={{ margin:0, fontWeight:700, color:"#0f172a", fontSize:"1rem",
                    maxWidth:480, lineHeight:1.3 }}>
                    {selectedAssess.title}
                  </h5>
                  <p style={{ margin:"3px 0 0", fontSize:".78rem", color:"#94a3b8" }}>
                    {selectedDept} · {selectedAssess.type==="AI" ? "AI Assessment" : "Google Form Assessment"}
                  </p>
                </div>

                <button onClick={handleDownload}
                  disabled={results.length===0 || downloading}
                  style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding:"9px 20px", borderRadius:8, fontWeight:700,
                    fontSize:".85rem", border:"none", fontFamily:"inherit",
                    cursor: results.length>0 ? "pointer" : "not-allowed",
                    background: results.length>0 ? "#16a34a" : "#f1f5f9",
                    color:      results.length>0 ? "#fff"    : "#94a3b8",
                    transition:"all .15s",
                    boxShadow: results.length>0 ? "0 2px 8px rgba(22,163,74,.3)" : "none",
                  }}>
                  {downloading ? "⏳ Generating…" : "📥 Download Excel"}
                </button>
              </div>

              {loadingResults ? (
                <div style={{ textAlign:"center", padding:"48px 0" }}>
                  <div className="spinner-border text-primary" />
                  <p style={{ marginTop:12, color:"#64748b", fontSize:".88rem" }}>Loading results…</p>
                </div>

              ) : results.length === 0 ? (
                <div style={{ textAlign:"center", padding:"60px 0",
                  background:"#f8fafc", borderRadius:12, color:"#94a3b8" }}>
                  <div style={{ fontSize:"3rem" }}>📭</div>
                  <h6 style={{ color:"#64748b", marginTop:8 }}>No Attempts Yet</h6>
                  <p style={{ fontSize:".85rem" }}>
                    No students have attempted this assessment yet.
                  </p>
                </div>

              ) : (
                <>
                  {/* Stats row */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                    gap:12, marginBottom:18 }}>
                    {[
                      { icon:"👥", label:"Total Attempted", value:total,          color:"#1d4ed8", bg:"#eff6ff" },
                      { icon:"📊", label:"Average Score",   value:`${avg}%`,      color:"#7c3aed", bg:"#f5f3ff" },
                      { icon:"🏆", label:"Highest Score",   value:`${highest}%`,  color:"#16a34a", bg:"#f0fdf4" },
                      { icon:"✅", label:"Passed (≥50%)",   value:`${passed}/${total}`, color:"#d97706", bg:"#fffbeb" },
                    ].map(s => (
                      <div key={s.label} style={{ background:s.bg,
                        border:`1px solid ${s.color}18`, borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ fontSize:"1.2rem" }}>{s.icon}</div>
                        <div style={{ fontSize:"1.3rem", fontWeight:700, color:s.color, lineHeight:1.2, marginTop:4 }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize:".72rem", color:"#64748b", marginTop:2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Search */}
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Search by name or register number…"
                      style={{ width:"100%", maxWidth:300, padding:"8px 12px",
                        border:"1px solid #e2e8f0", borderRadius:8, fontSize:".85rem",
                        outline:"none", fontFamily:"inherit" }} />
                    {search && (
                      <button onClick={()=>setSearch("")}
                        style={{ padding:"7px 12px", border:"1px solid #e2e8f0",
                          borderRadius:8, background:"#fff", fontSize:".8rem",
                          cursor:"pointer", color:"#64748b", fontFamily:"inherit" }}>
                        ✕ Clear
                      </button>
                    )}
                    <span style={{ marginLeft:"auto", fontSize:".78rem", color:"#94a3b8" }}>
                      {filtered.length} of {total}
                    </span>
                  </div>

                  {/* Table */}
                  <div style={{ borderRadius:10, border:"1px solid #e2e8f0", overflow:"hidden" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".875rem" }}>
                      <thead>
                        <tr style={{ background:"#02142c" }}>
                          {["Rank","Register No.","Student Name","Score","Total","Percentage","Grade","Date"].map(h => (
                            <th key={h} style={{ padding:"10px 14px", textAlign:"left",
                              fontWeight:600, color:"rgba(255,255,255,.85)",
                              fontSize:".72rem", textTransform:"uppercase",
                              letterSpacing:".05em", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r, i) => {
                          const b = badgeStyle(r.percentage);
                          return (
                            <tr key={r.id} style={{ borderBottom:"1px solid #f1f5f9",
                              background: i%2===0 ? "#fff" : "#fafafa" }}>
                              <td style={{ padding:"10px 14px", fontWeight:700,
                                color:"#94a3b8", fontSize:".8rem" }}>
                                {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                              </td>
                              <td style={{ padding:"10px 14px", fontWeight:600,
                                color:"#1e293b", fontSize:".82rem" }}>
                                {r.registerNumber || "—"}
                              </td>
                              <td style={{ padding:"10px 14px", color:"#374151" }}>
                                {r.studentName || "—"}
                              </td>
                              <td style={{ padding:"10px 14px", fontWeight:700, color:"#1e293b" }}>
                                {r.score}
                              </td>
                              <td style={{ padding:"10px 14px", color:"#94a3b8" }}>
                                {r.totalMarks}
                              </td>
                              <td style={{ padding:"10px 14px" }}>
                                <span style={{ background:b.bg, color:b.color,
                                  padding:"3px 10px", borderRadius:20,
                                  fontWeight:700, fontSize:".78rem" }}>
                                  {r.percentage}%
                                </span>
                              </td>
                              <td style={{ padding:"10px 14px" }}>
                                <span style={{ color:b.color, fontSize:".78rem", fontWeight:600 }}>
                                  {b.label}
                                </span>
                              </td>
                              <td style={{ padding:"10px 14px", color:"#64748b", fontSize:".78rem" }}>
                                {fmtDate(r.submittedAt)}
                              </td>
                            </tr>
                          );
                        })}
                        {filtered.length===0 && (
                          <tr>
                            <td colSpan={8} style={{ padding:"32px", textAlign:"center",
                              color:"#94a3b8", fontSize:".88rem" }}>
                              No results match "<strong>{search}</strong>"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
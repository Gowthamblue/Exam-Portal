import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

const initials = (n="") => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

// ✅ F component is OUTSIDE StudentProfile — fixes the focus loss bug
const F = ({ label, name, value, type="text", disabled=false, options=null, placeholder="", editMode, onChange }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:"block", fontSize:".75rem", fontWeight:600, color:"#64748b",
      textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{label}</label>
    {options
      ? <select name={name} value={value||""} onChange={onChange} disabled={!editMode||disabled}
          style={{ width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8,
            fontSize:".875rem", background:(!editMode||disabled)?"#f8fafc":"#fff",
            color:"#1e293b", outline:"none" }}>
          <option value="">Select…</option>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      : <input name={name} type={type} value={value||""} placeholder={placeholder}
          onChange={onChange} disabled={!editMode||disabled}
          style={{ width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8,
            fontSize:".875rem", background:(!editMode||disabled)?"#f8fafc":"#fff",
            color:"#1e293b", outline:"none" }} />
    }
  </div>
);

export default function StudentProfile() {
  const [profile,    setProfile]    = useState({});
  const [editMode,   setEditMode]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [results,    setResults]    = useState([]);
  const [tab,        setTab]        = useState("personal");

  useEffect(() => {
    (async () => {
      const user = auth.currentUser; if (!user) return;
      const snap = await getDoc(doc(db,"users",user.uid));
      if (snap.exists()) {
        const data = snap.data(); setProfile(data);
        const rs = await getDocs(query(collection(db,"results"), where("registerNumber","==",data.registerNumber)));
        const arr = rs.docs.map(d=>({id:d.id,...d.data()}));
        arr.sort((a,b)=>(b.submittedAt?.toDate?.()|| 0)-(a.submittedAt?.toDate?.()|| 0));
        setResults(arr);
      }
      setLoading(false);
    })();
  }, []);

  const onChange = e => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSave = async () => {
    const user = auth.currentUser; if (!user) return;
    setSaving(true);
    await updateDoc(doc(db,"users",user.uid), {
      phone:profile.phone||"", address:profile.address||"", city:profile.city||"",
      state:profile.state||"", pincode:profile.pincode||"", dob:profile.dob||"",
      gender:profile.gender||"", bloodGroup:profile.bloodGroup||"",
      github:profile.github||"", linkedin:profile.linkedin||"",
      cgpa:profile.cgpa||"", yearOfStudy:profile.yearOfStudy||"",
      batch:profile.batch||"", about:profile.about||"",
    });
    setSaving(false); setSaved(true); setEditMode(false);
    setTimeout(()=>setSaved(false), 3000);
  };

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading profile…</p>
    </div>
  );

  const total = results.length;
  const avg   = total ? Math.round(results.reduce((s,r)=>s+r.percentage,0)/total) : 0;
  const best  = total ? Math.max(...results.map(r=>r.percentage)) : 0;
  const pass  = results.filter(r=>r.percentage>=50).length;

  // Shorthand to pass editMode and onChange into F without repeating
  const field = (props) => <F {...props} editMode={editMode} onChange={onChange} />;

  return (
    <div>
      {/* Hero banner */}
      <div style={{ background:"linear-gradient(135deg,#0f172a,#1d4ed8)", borderRadius:12,
        padding:"24px 28px", marginBottom:20, color:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ width:72, height:72, background:"rgba(255,255,255,.15)", border:"3px solid rgba(255,255,255,.3)",
            borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.5rem", fontWeight:800, flexShrink:0 }}>{initials(profile.name)}</div>
          <div style={{ flex:1 }}>
            <h4 style={{ margin:0, fontWeight:800 }}>{profile.name}</h4>
            <p style={{ margin:"4px 0 0", opacity:.7, fontSize:".85rem" }}>{profile.email}</p>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {[
                profile.department && `🎓 ${profile.department}`,
                profile.yearOfStudy && `📅 Year ${profile.yearOfStudy}`,
                profile.batch && `🏷 ${profile.batch}`,
                profile.registerNumber && `🪪 ${profile.registerNumber}`,
              ].filter(Boolean).map(tag=>(
                <span key={tag} style={{ background:"rgba(255,255,255,.15)", padding:"2px 10px",
                  borderRadius:20, fontSize:".72rem", fontWeight:600 }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink:0 }}>
            {!editMode
              ? <button onClick={()=>setEditMode(true)} style={{ background:"rgba(255,255,255,.15)",
                  border:"1px solid rgba(255,255,255,.3)", color:"#fff", padding:"8px 16px",
                  borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:".85rem" }}>✏️ Edit</button>
              : <div style={{ display:"flex", gap:8 }}>
                  <button onClick={onSave} disabled={saving} style={{ background:"#fbbf24", border:"none",
                    color:"#1c1917", padding:"8px 16px", borderRadius:8, cursor:"pointer",
                    fontWeight:700, fontSize:".85rem" }}>{saving?"Saving…":"💾 Save"}</button>
                  <button onClick={()=>setEditMode(false)} style={{ background:"rgba(255,255,255,.1)",
                    border:"1px solid rgba(255,255,255,.2)", color:"#fff", padding:"8px 14px",
                    borderRadius:8, cursor:"pointer", fontSize:".85rem" }}>Cancel</button>
                </div>
            }
          </div>
        </div>
        {saved && (
          <div style={{ position:"absolute", bottom:16, right:16, background:"#f0fdf4", color:"#16a34a",
            padding:"6px 14px", borderRadius:8, fontSize:".82rem", fontWeight:700, border:"1px solid #bbf7d0" }}>
            ✅ Saved!
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { icon:"📝", label:"Tests Taken",  value:total,               color:"#1d4ed8", bg:"#eff6ff" },
          { icon:"📊", label:"Avg Score",    value:total?`${avg}%`:"—", color:"#7c3aed", bg:"#f5f3ff" },
          { icon:"🏆", label:"Best Score",   value:total?`${best}%`:"—",color:"#16a34a", bg:"#f0fdf4" },
          { icon:"✅", label:"Passed",       value:total?`${pass}/${total}`:"—", color:"#d97706", bg:"#fffbeb" },
        ].map(s=>(
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}20`,
            borderRadius:10, padding:"14px", textAlign:"center" }}>
            <div style={{ fontSize:"1.3rem" }}>{s.icon}</div>
            <div style={{ fontSize:"1.3rem", fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:".72rem", color:"#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"2px solid #e2e8f0", marginBottom:24, gap:4 }}>
        {[
          { key:"personal", label:"👤 Personal" },
          { key:"academic", label:"🎓 Academic"  },
          { key:"contact",  label:"📍 Contact"   },
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            border:"none", background:"none", padding:"10px 18px", cursor:"pointer", fontSize:".875rem",
            fontWeight: tab===t.key?700:500, color: tab===t.key?"#1d4ed8":"#64748b",
            borderBottom: tab===t.key?"2px solid #1d4ed8":"2px solid transparent",
            marginBottom:"-2px", borderRadius:"4px 4px 0 0" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Personal tab */}
      {tab==="personal" && (
        <div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:".75rem", fontWeight:600, color:"#64748b",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>About Me</label>
            <textarea name="about" value={profile.about||""} onChange={onChange}
              disabled={!editMode} placeholder="Write a short bio about yourself…" rows={3}
              style={{ width:"100%", padding:"8px 12px", border:"1px solid #e2e8f0", borderRadius:8,
                fontSize:".875rem", background:!editMode?"#f8fafc":"#fff", resize:"vertical", outline:"none" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
            <div>
              {field({ label:"Full Name",    name:"name",           value:profile.name,           disabled:true })}
              {field({ label:"Email",        name:"email",          value:profile.email,          disabled:true })}
              {field({ label:"Register No.", name:"registerNumber", value:profile.registerNumber, disabled:true })}
            </div>
            <div>
              {field({ label:"Date of Birth", name:"dob",        value:profile.dob,        type:"date" })}
              {field({ label:"Gender",        name:"gender",      value:profile.gender,     options:["Male","Female","Prefer not to say"] })}
              {field({ label:"Blood Group",   name:"bloodGroup",  value:profile.bloodGroup, options:["A+","A-","B+","B-","AB+","AB-","O+","O-"] })}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
            {field({ label:"Phone",    name:"phone",    value:profile.phone,    placeholder:"10-digit mobile" })}
            {field({ label:"LinkedIn", name:"linkedin", value:profile.linkedin, placeholder:"https://linkedin.com/in/…" })}
          </div>
          {field({ label:"GitHub", name:"github", value:profile.github, placeholder:"https://github.com/…" })}
        </div>
      )}

      {/* Academic tab */}
      {tab==="academic" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
            <div>
              {field({ label:"Department",    name:"department",  value:profile.department,  disabled:true })}
              {field({ label:"Year of Study", name:"yearOfStudy", value:profile.yearOfStudy, options:["1","2","3","4"] })}
              {field({ label:"Batch/Section", name:"batch",       value:profile.batch,       placeholder:"e.g. 2022–2026" })}
            </div>
            <div>
              {field({ label:"Register Number", name:"registerNumber", value:profile.registerNumber, disabled:true })}
              {field({ label:"CGPA",            name:"cgpa",           value:profile.cgpa,           placeholder:"e.g. 8.5" })}
              {field({ label:"College Email",   name:"email",          value:profile.email,          disabled:true })}
            </div>
          </div>
          {results.length > 0 && (
            <div style={{ marginTop:20 }}>
              <p style={{ fontWeight:600, color:"#374151", fontSize:".88rem", marginBottom:10 }}>Recent Assessment Results</p>
              <div style={{ borderRadius:10, border:"1px solid #e2e8f0", overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".85rem" }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Assessment","Score","Percentage","Date"].map(h=>(
                        <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontWeight:600,
                          color:"#374151", borderBottom:"1px solid #e2e8f0", fontSize:".75rem",
                          textTransform:"uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0,5).map(r=>(
                      <tr key={r.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"9px 14px", fontWeight:500, color:"#1e293b" }}>{r.assessmentTitle}</td>
                        <td style={{ padding:"9px 14px", color:"#374151" }}>{r.score}/{r.totalMarks}</td>
                        <td style={{ padding:"9px 14px" }}>
                          <span style={{
                            background: r.percentage>=80?"#f0fdf4":r.percentage>=50?"#fffbeb":"#fef2f2",
                            color: r.percentage>=80?"#16a34a":r.percentage>=50?"#d97706":"#dc2626",
                            padding:"2px 10px", borderRadius:20, fontWeight:600, fontSize:".75rem" }}>
                            {r.percentage}%
                          </span>
                        </td>
                        <td style={{ padding:"9px 14px", color:"#64748b", fontSize:".8rem" }}>
                          {r.submittedAt?.toDate?.().toLocaleDateString("en-IN")||"—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.length>5 && <p style={{ color:"#94a3b8", fontSize:".78rem", marginTop:6 }}>+{results.length-5} more in My Results</p>}
            </div>
          )}
        </div>
      )}

      {/* Contact tab */}
      {tab==="contact" && (
        <div>
          {field({ label:"Full Address", name:"address", value:profile.address, placeholder:"Door no., Street, Area…" })}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 24px" }}>
            {field({ label:"City",    name:"city",    value:profile.city,    placeholder:"e.g. Coimbatore" })}
            {field({ label:"State",   name:"state",   value:profile.state,   placeholder:"e.g. Tamil Nadu" })}
            {field({ label:"Pincode", name:"pincode", value:profile.pincode, placeholder:"6-digit" })}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
            {field({ label:"Phone", name:"phone", value:profile.phone, placeholder:"10-digit mobile" })}
            {field({ label:"Email", name:"email", value:profile.email, disabled:true })}
          </div>
        </div>
      )}

      {/* Edit bottom bar */}
      {editMode && (
        <div style={{ marginTop:24, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10,
          padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <p style={{ margin:0, color:"#d97706", fontWeight:600, fontSize:".88rem" }}>
            ✏️ You are in edit mode — unsaved changes will be lost if you navigate away.
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setEditMode(false)} style={{ padding:"7px 14px", border:"1px solid #e2e8f0",
              borderRadius:8, background:"#fff", cursor:"pointer", fontSize:".85rem" }}>Discard</button>
            <button onClick={onSave} disabled={saving} style={{ padding:"7px 20px", border:"none",
              borderRadius:8, background:"#16a34a", color:"#fff", cursor:"pointer",
              fontWeight:700, fontSize:".85rem" }}>{saving?"Saving…":"💾 Save Changes"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
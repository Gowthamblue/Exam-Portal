import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

function StudentProfile() {
  const [profile, setProfile]   = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [results, setResults]   = useState([]);
  const [activeTab, setActiveTab] = useState("profile"); // profile | academic | stats

  useEffect(() => {
    const fetchAll = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile(data);

        // Fetch results for stats
        const q = query(collection(db, "results"), where("registerNumber", "==", data.registerNumber));
        const snap = await getDocs(q);
        const res = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        res.sort((a, b) => (b.submittedAt?.toDate?.() || 0) - (a.submittedAt?.toDate?.() || 0));
        setResults(res);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      phone:        profile.phone || "",
      address:      profile.address || "",
      city:         profile.city || "",
      state:        profile.state || "",
      pincode:      profile.pincode || "",
      dob:          profile.dob || "",
      gender:       profile.gender || "",
      bloodGroup:   profile.bloodGroup || "",
      github:       profile.github || "",
      linkedin:     profile.linkedin || "",
      cgpa:         profile.cgpa || "",
      yearOfStudy:  profile.yearOfStudy || "",
      batch:        profile.batch || "",
      about:        profile.about || "",
    });
    setSaving(false);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading profile...</p>
      </div>
    );
  }

  // Stats
  const totalTests   = results.length;
  const avgScore     = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / totalTests) : 0;
  const bestScore    = totalTests > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;
  const passCount    = results.filter((r) => r.percentage >= 50).length;

  const getInitials = (name = "") => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const tabStyle = (active) => ({
    border: "none",
    borderBottom: active ? "3px solid #0d6efd" : "3px solid transparent",
    background: "transparent",
    color: active ? "#0d6efd" : "#64748b",
    fontWeight: active ? 700 : 400,
    padding: "10px 20px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const Field = ({ label, name, value, type = "text", disabled = false, options = null, placeholder = "" }) => (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ fontSize: "0.82rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {options ? (
        <select name={name} className="form-select form-select-sm" value={value || ""} onChange={handleChange} disabled={!editMode || disabled}
          style={{ backgroundColor: !editMode ? "#f8fafc" : "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <option value="">Select...</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input name={name} type={type} className="form-control form-control-sm" value={value || ""} placeholder={placeholder}
          onChange={handleChange} disabled={!editMode || disabled}
          style={{ backgroundColor: (!editMode || disabled) ? "#f8fafc" : "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
      )}
    </div>
  );

  return (
    <div>
      {/* Profile hero banner */}
      <div className="rounded-3 p-4 mb-4 text-white position-relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2544, #1a56db)" }}>
        <div className="d-flex align-items-center gap-4">
          {/* Avatar */}
          <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
            style={{ width: 72, height: 72, fontSize: "1.6rem", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)" }}>
            {getInitials(profile.name)}
          </div>
          <div className="flex-grow-1">
            <h4 className="fw-bold mb-0">{profile.name}</h4>
            <p className="mb-1 opacity-75" style={{ fontSize: "0.88rem" }}>{profile.email}</p>
            <div className="d-flex gap-2 flex-wrap mt-1">
              <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                🎓 {profile.department}
              </span>
              {profile.yearOfStudy && (
                <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                  📅 Year {profile.yearOfStudy}
                </span>
              )}
              {profile.batch && (
                <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                  🏷 Batch {profile.batch}
                </span>
              )}
              <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
                🪪 {profile.registerNumber}
              </span>
            </div>
          </div>

          {/* Edit/Save buttons */}
          <div className="flex-shrink-0">
            {!editMode ? (
              <button className="btn btn-sm btn-light fw-semibold" onClick={() => setEditMode(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-warning fw-semibold" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : "💾 Save"}
                </button>
                <button className="btn btn-sm btn-light" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {/* Saved toast */}
        {saved && (
          <div className="position-absolute bottom-0 end-0 m-3 px-3 py-2 rounded-2"
            style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "0.82rem", fontWeight: 600 }}>
            ✅ Profile saved!
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4">
        {[
          { icon: "📝", label: "Tests Taken",  value: totalTests,             color: "#0d6efd", bg: "#e7f0ff" },
          { icon: "📊", label: "Avg Score",    value: totalTests ? `${avgScore}%` : "—",  color: "#7c3aed", bg: "#f3eeff" },
          { icon: "🏆", label: "Best Score",   value: totalTests ? `${bestScore}%` : "—", color: "#16a34a", bg: "#e6f9ef" },
          { icon: "✅", label: "Passed",       value: totalTests ? `${passCount}/${totalTests}` : "—", color: "#f59e0b", bg: "#fffbeb" },
        ].map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className="p-3 rounded-3 text-center h-100"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.color}22` }}>
              <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
              <div className="fw-bold" style={{ fontSize: "1.3rem", color: s.color }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize: "0.78rem" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex mb-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
        <button style={tabStyle(activeTab === "profile")}  onClick={() => setActiveTab("profile")}>👤 Personal Info</button>
        <button style={tabStyle(activeTab === "academic")} onClick={() => setActiveTab("academic")}>🎓 Academic</button>
        <button style={tabStyle(activeTab === "contact")}  onClick={() => setActiveTab("contact")}>📍 Contact</button>
      </div>

      {/* ── PERSONAL INFO TAB ── */}
      {activeTab === "profile" && (
        <div>
          {profile.about !== undefined || editMode ? (
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: "0.82rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                About Me
              </label>
              <textarea name="about" className="form-control" rows={3}
                value={profile.about || ""} onChange={handleChange}
                disabled={!editMode} placeholder="Write a short bio about yourself..."
                style={{ backgroundColor: !editMode ? "#f8fafc" : "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", resize: "vertical" }} />
            </div>
          ) : null}

          <div className="row g-0">
            <div className="col-md-6 pe-md-3">
              <Field label="Full Name"     name="name"   value={profile.name}   disabled />
              <Field label="Email"         name="email"  value={profile.email}  disabled />
              <Field label="Register No."  name="registerNumber" value={profile.registerNumber} disabled />
            </div>
            <div className="col-md-6 ps-md-3">
              <Field label="Date of Birth" name="dob"    value={profile.dob}    type="date" />
              <Field label="Gender"        name="gender" value={profile.gender}
                options={["Male", "Female", "Prefer not to say"]} />
              <Field label="Blood Group"   name="bloodGroup" value={profile.bloodGroup}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            </div>
          </div>

          <div className="row g-0">
            <div className="col-md-6 pe-md-3">
              <Field label="Phone Number"  name="phone"   value={profile.phone}   placeholder="10-digit mobile number" />
            </div>
            <div className="col-md-6 ps-md-3">
              <Field label="LinkedIn URL"  name="linkedin" value={profile.linkedin} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="col-12">
              <Field label="GitHub URL"    name="github"  value={profile.github}   placeholder="https://github.com/..." />
            </div>
          </div>
        </div>
      )}

      {/* ── ACADEMIC TAB ── */}
      {activeTab === "academic" && (
        <div className="row g-0">
          <div className="col-md-6 pe-md-3">
            <Field label="Department"   name="department"  value={profile.department}  disabled />
            <Field label="Year of Study" name="yearOfStudy" value={profile.yearOfStudy}
              options={["1", "2", "3", "4"]} />
            <Field label="Batch / Section" name="batch"    value={profile.batch}       placeholder="e.g. 2022–2026 or Section A" />
          </div>
          <div className="col-md-6 ps-md-3">
            <Field label="Register Number" name="registerNumber" value={profile.registerNumber} disabled />
            <Field label="CGPA"           name="cgpa"   value={profile.cgpa}   placeholder="e.g. 8.5" />
            <Field label="College Email"  name="email"  value={profile.email}  disabled />
          </div>

          {/* Recent results mini table */}
          {results.length > 0 && (
            <div className="col-12 mt-2">
              <p className="fw-semibold mb-2" style={{ fontSize: "0.88rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Recent Assessment Results
              </p>
              <div className="table-responsive">
                <table className="table table-sm table-bordered" style={{ fontSize: "0.85rem" }}>
                  <thead className="table-dark">
                    <tr><th>Assessment</th><th>Score</th><th>Percentage</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 5).map((r) => (
                      <tr key={r.id}>
                        <td>{r.assessmentTitle}</td>
                        <td>{r.score}/{r.totalMarks}</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: r.percentage >= 80 ? "#dcfce7" : r.percentage >= 50 ? "#fef9c3" : "#fee2e2",
                            color: r.percentage >= 80 ? "#16a34a" : r.percentage >= 50 ? "#ca8a04" : "#dc2626",
                          }}>
                            {r.percentage}%
                          </span>
                        </td>
                        <td>{r.submittedAt?.toDate?.().toLocaleDateString("en-IN") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length > 5 && (
                  <p className="text-muted" style={{ fontSize: "0.8rem" }}>+ {results.length - 5} more in My Results</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === "contact" && (
        <div className="row g-0">
          <div className="col-12">
            <Field label="Full Address" name="address" value={profile.address} placeholder="Door no., Street, Area..." />
          </div>
          <div className="col-md-4 pe-md-3">
            <Field label="City"    name="city"    value={profile.city}    placeholder="e.g. Coimbatore" />
          </div>
          <div className="col-md-4 px-md-2">
            <Field label="State"   name="state"   value={profile.state}   placeholder="e.g. Tamil Nadu" />
          </div>
          <div className="col-md-4 ps-md-3">
            <Field label="Pincode" name="pincode" value={profile.pincode} placeholder="6-digit pincode" />
          </div>
          <div className="col-md-6 pe-md-3">
            <Field label="Phone"   name="phone"   value={profile.phone}   placeholder="10-digit mobile number" />
          </div>
          <div className="col-md-6 ps-md-3">
            <Field label="Email"   name="email"   value={profile.email}   disabled />
          </div>
        </div>
      )}

      {/* Edit mode bottom bar */}
      {editMode && (
        <div className="mt-4 p-3 rounded-3 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
          <p className="mb-0 text-warning fw-semibold" style={{ fontSize: "0.88rem" }}>
            ✏️ You are in edit mode — unsaved changes will be lost if you navigate away.
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditMode(false)}>Discard</button>
            <button className="btn btn-sm btn-success fw-semibold px-4" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;
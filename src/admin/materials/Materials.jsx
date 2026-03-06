import { useEffect, useState } from "react";
import AdminCard from "../../components/AdminCard";
import {
  collection, getDocs, query, where,
  deleteDoc, doc, addDoc
} from "firebase/firestore";
import { db } from "../../firebase";

const departments = ["CSE", "ECE", "MECH"];

const getMaterialType = (link = "") => {
  const l = link.toLowerCase();
  if (l.includes("youtube.com") || l.includes("youtu.be"))
    return { icon: "▶️", label: "Video",  color: "#dc3545", bg: "#fff5f5" };
  if (l.endsWith(".pdf") || l.includes("pdf"))
    return { icon: "📄", label: "PDF",    color: "#dc6c00", bg: "#fff8f0" };
  if (l.includes("drive.google.com"))
    return { icon: "📁", label: "Drive",  color: "#1a73e8", bg: "#f0f6ff" };
  if (l.includes("docs.google.com"))
    return { icon: "📝", label: "Doc",    color: "#0f9d58", bg: "#f0fdf4" };
  if (l.includes("github.com"))
    return { icon: "💻", label: "Code",   color: "#1e293b", bg: "#f8fafc" };
  if (l.includes("slides") || l.includes("ppt"))
    return { icon: "📊", label: "Slides", color: "#f59e0b", bg: "#fffbeb" };
  return   { icon: "🔗", label: "Link",   color: "#6366f1", bg: "#f5f3ff" };
};

function Materials() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [materials, setMaterials]       = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [description, setDescription]   = useState("");
  const [link, setLink]                 = useState("");
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState("");
  const [deptCounts, setDeptCounts]     = useState({});

  // Fetch counts for all depts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      const snapshot = await getDocs(collection(db, "materials"));
      const counts = {};
      snapshot.docs.forEach((d) => {
        const dept = d.data().department;
        counts[dept] = (counts[dept] || 0) + 1;
      });
      setDeptCounts(counts);
    };
    fetchCounts();
  }, []);

  const fetchMaterials = async (dept) => {
    const q = query(collection(db, "materials"), where("department", "==", dept));
    const snapshot = await getDocs(q);
    const data = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
    setMaterials(data);
  };

  useEffect(() => {
    if (selectedDept) fetchMaterials(selectedDept);
  }, [selectedDept]);

  const handleAddMaterial = async () => {
    if (!description.trim() || !link.trim()) { alert("Please fill all fields"); return; }
    setSaving(true);
    await addDoc(collection(db, "materials"), {
      department: selectedDept, description: description.trim(),
      link: link.trim(), createdAt: new Date(),
    });
    setDescription(""); setLink(""); setShowForm(false); setSaving(false);
    fetchMaterials(selectedDept);
    setDeptCounts((prev) => ({ ...prev, [selectedDept]: (prev[selectedDept] || 0) + 1 }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    await deleteDoc(doc(db, "materials", id));
    fetchMaterials(selectedDept);
    setDeptCounts((prev) => ({ ...prev, [selectedDept]: Math.max(0, (prev[selectedDept] || 1) - 1) }));
  };

  const filtered = materials.filter((m) =>
    search.trim() === "" || m.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts) => {
    if (!ts?.toDate) return "-";
    return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const linkPreview = link.trim() ? getMaterialType(link) : null;

  return (
    <AdminCard title="Materials">

      {/* Department selector */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {departments.map((dept) => (
          <div key={dept}
            onClick={() => { setSelectedDept(dept); setShowForm(false); setSearch(""); }}
            className="p-3 text-center shadow-sm"
            style={{
              cursor: "pointer", minWidth: "120px", borderRadius: "10px",
              backgroundColor: selectedDept === dept ? "#0d6efd" : "#f8f9fa",
              color: selectedDept === dept ? "#fff" : "#000",
              fontWeight: "600", transition: "all 0.2s",
            }}
          >
            {dept}
            <div style={{ fontSize: "0.72rem", opacity: 0.8, marginTop: 2 }}>
              {deptCounts[dept] || 0} materials
            </div>
          </div>
        ))}
      </div>

      {selectedDept && (
        <>
          {/* Section header */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h6 className="fw-bold mb-0">{selectedDept} — Study Materials</h6>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Cancel" : "➕ Add Material"}
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="p-4 rounded-3 mb-4" style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}>
              <h6 className="fw-semibold mb-3">New Material</h6>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Description *</label>
                <input className="form-control" placeholder="e.g. Operating Systems Notes — Unit 1"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Material Link *</label>
                <input className="form-control" placeholder="https://..."
                  value={link} onChange={(e) => setLink(e.target.value)} />

                {/* Live link type preview */}
                {linkPreview && (
                  <div className="mt-2 d-flex align-items-center gap-2 p-2 rounded-2"
                    style={{ backgroundColor: linkPreview.bg, border: `1px solid ${linkPreview.color}33`, fontSize: "0.82rem" }}>
                    <span>{linkPreview.icon}</span>
                    <span style={{ color: linkPreview.color, fontWeight: 600 }}>Detected: {linkPreview.label}</span>
                    <span className="text-muted">— students will see this as a {linkPreview.label} material</span>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-success btn-sm fw-semibold px-4"
                  onClick={handleAddMaterial} disabled={saving || !description.trim() || !link.trim()}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : "💾 Save Material"}
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Search bar */}
          {materials.length > 0 && (
            <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
              <input className="form-control form-control-sm" placeholder="🔍 Search materials..."
                value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: "240px" }} />
              {search && (
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSearch("")} style={{ fontSize: "0.78rem", borderRadius: "20px" }}>
                  ✕ Clear
                </button>
              )}
              <span className="text-muted ms-auto" style={{ fontSize: "0.8rem" }}>
                {filtered.length} of {materials.length} shown
              </span>
            </div>
          )}

          {/* Empty state */}
          {materials.length === 0 && (
            <div className="text-center py-4 text-muted">
              <p style={{ fontSize: "2.5rem" }}>📭</p>
              <p>No materials uploaded for {selectedDept} yet.</p>
            </div>
          )}

          {/* No search results */}
          {materials.length > 0 && filtered.length === 0 && (
            <div className="text-center py-3 text-muted">
              <p>No materials match "<strong>{search}</strong>"</p>
            </div>
          )}

          {/* Materials list */}
          {filtered.length > 0 && (
            <div className="d-flex flex-column gap-3">
              {filtered.map((m, index) => {
                const type = getMaterialType(m.link);
                return (
                  <div key={m.id} className="p-3 rounded-3 d-flex align-items-center gap-3"
                    style={{ border: "1px solid #e2e8f0", backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

                    {/* Type icon */}
                    <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                      style={{ width: 44, height: 44, backgroundColor: type.bg, fontSize: "1.3rem", border: `1px solid ${type.color}22` }}>
                      {type.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className="badge" style={{ backgroundColor: type.bg, color: type.color, fontSize: "0.68rem", border: `1px solid ${type.color}33` }}>
                          {type.label}
                        </span>
                        <span className="badge bg-light text-secondary" style={{ fontSize: "0.68rem" }}>#{index + 1}</span>
                      </div>
                      <p className="fw-semibold mb-0" style={{ fontSize: "0.92rem", color: "#1e293b" }}>{m.description}</p>
                      <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
                        📅 Added {formatDate(m.createdAt)} &nbsp;·&nbsp;
                        <a href={m.link} target="_blank" rel="noreferrer"
                          style={{ color: type.color, fontSize: "0.78rem" }}>
                          {m.link.length > 50 ? m.link.slice(0, 50) + "..." : m.link}
                        </a>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-column gap-1 flex-shrink-0">
                      <a href={m.link} target="_blank" rel="noreferrer"
                        className="btn btn-sm fw-semibold"
                        style={{ backgroundColor: type.color, color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.78rem", padding: "4px 12px", textDecoration: "none" }}>
                        Open ↗
                      </a>
                      <button className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: "0.78rem", padding: "4px 12px", borderRadius: "8px" }}
                        onClick={() => handleDelete(m.id)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </AdminCard>
  );
}

export default Materials;
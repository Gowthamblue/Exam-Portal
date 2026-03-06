import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

const PRIORITY_CONFIG = {
  high:   { color: "#dc3545", bg: "#fff5f5", badge: "#fecaca", label: "High",   icon: "🔴" },
  medium: { color: "#f59e0b", bg: "#fffbeb", badge: "#fde68a", label: "Medium", icon: "🟡" },
  normal: { color: "#0d6efd", bg: "#eff6ff", badge: "#bfdbfe", label: "Normal", icon: "🔵" },
};

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [targetDept, setTargetDept] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [search, setSearch] = useState("");

  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handlePost = async () => {
    if (!message.trim()) { alert("Please enter a message"); return; }
    setPosting(true);
    await addDoc(collection(db, "announcements"), {
      message: message.trim(), priority, targetDept, createdAt: new Date(),
    });
    setMessage(""); setPriority("normal"); setTargetDept("all");
    setShowForm(false); setPosting(false);
    fetchAnnouncements();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "announcements", id));
    fetchAnnouncements();
  };

  const handleEditSave = async (id) => {
    if (!editMessage.trim()) return;
    await updateDoc(doc(db, "announcements", id), { message: editMessage.trim() });
    setEditingId(null);
    fetchAnnouncements();
  };

  const filtered = announcements.filter((a) => {
    const matchPriority = filterPriority === "all" || a.priority === filterPriority;
    const matchDept = filterDept === "all" || (a.targetDept || "all") === filterDept;
    const matchSearch = search.trim() === "" || a.message.toLowerCase().includes(search.toLowerCase());
    return matchPriority && matchDept && matchSearch;
  });

  const counts = {
    high: announcements.filter((a) => a.priority === "high").length,
    medium: announcements.filter((a) => a.priority === "medium").length,
    normal: announcements.filter((a) => a.priority === "normal").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">📢 Announcements</h4>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            {announcements.length} total &nbsp;·&nbsp;
            <span className="text-danger">{counts.high} high</span> &nbsp;·&nbsp;
            <span className="text-warning">{counts.medium} medium</span> &nbsp;·&nbsp;
            <span className="text-primary">{counts.normal} normal</span>
          </p>
        </div>
        <button className="btn btn-primary btn-sm fw-semibold" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "➕ New Announcement"}
        </button>
      </div>

      {/* Post Form */}
      {showForm && (
        <div className="rounded-3 p-4 mb-4" style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}>
          <h6 className="fw-bold mb-3">New Announcement</h6>
          <textarea
            className="form-control mb-3" rows={3}
            placeholder="Type your announcement message here..."
            value={message} onChange={(e) => setMessage(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Priority</label>
              <div className="d-flex gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <button key={key} type="button" onClick={() => setPriority(key)}
                    className="btn btn-sm flex-grow-1"
                    style={{
                      backgroundColor: priority === key ? cfg.color : "#f1f5f9",
                      color: priority === key ? "#fff" : "#374151",
                      border: priority === key ? "none" : "1px solid #d1d5db",
                      fontWeight: priority === key ? 600 : 400, borderRadius: "8px",
                    }}>
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Target Department</label>
              <select className="form-select" value={targetDept} onChange={(e) => setTargetDept(e.target.value)}>
                <option value="all">📣 All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary fw-semibold px-4" onClick={handlePost} disabled={posting || !message.trim()}>
              {posting ? (<><span className="spinner-border spinner-border-sm me-2" />Posting...</>) : "📢 Post Announcement"}
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-3 rounded-3 mb-4 d-flex gap-3 flex-wrap align-items-center"
        style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <input className="form-control form-control-sm" placeholder="🔍 Search announcements..."
          value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: "220px" }} />
        <div className="d-flex gap-1 flex-wrap">
          {["all", "high", "medium", "normal"].map((p) => {
            const cfg = p === "all" ? null : PRIORITY_CONFIG[p];
            const isActive = filterPriority === p;
            return (
              <button key={p} onClick={() => setFilterPriority(p)} className="btn btn-sm"
                style={{
                  borderRadius: "20px",
                  backgroundColor: isActive ? (cfg?.color || "#1e293b") : "#f1f5f9",
                  color: isActive ? "#fff" : "#374151", border: "none",
                  fontSize: "0.78rem", fontWeight: isActive ? 600 : 400, padding: "4px 12px",
                }}>
                {p === "all" ? `All (${announcements.length})` : `${cfg.icon} ${cfg.label} (${counts[p]})`}
              </button>
            );
          })}
        </div>
        <select className="form-select form-select-sm" style={{ maxWidth: "160px" }}
          value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="all">All Depts</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>
        {(search || filterPriority !== "all" || filterDept !== "all") && (
          <button className="btn btn-sm btn-outline-secondary"
            onClick={() => { setSearch(""); setFilterPriority("all"); setFilterDept("all"); }}
            style={{ fontSize: "0.78rem" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="text-muted mt-2">Loading announcements...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p style={{ fontSize: "2.5rem" }}>📭</p>
          <p>{announcements.length === 0 ? "No announcements posted yet." : "No announcements match your filter."}</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((a) => {
            const cfg = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.normal;
            const isEditing = editingId === a.id;
            return (
              <div key={a.id} className="rounded-3 p-3"
                style={{
                  borderLeft: `5px solid ${cfg.color}`,
                  backgroundColor: cfg.bg,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  border: `1px solid ${cfg.color}33`,
                  borderLeftWidth: "5px",
                }}>
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="flex-grow-1">
                    <div className="d-flex gap-2 mb-2 flex-wrap">
                      <span className="badge"
                        style={{ backgroundColor: cfg.badge, color: cfg.color, fontSize: "0.72rem" }}>
                        {cfg.icon} {cfg.label} Priority
                      </span>
                      {a.targetDept && a.targetDept !== "all" ? (
                        <span className="badge bg-primary" style={{ fontSize: "0.72rem" }}>{a.targetDept}</span>
                      ) : (
                        <span className="badge bg-secondary" style={{ fontSize: "0.72rem" }}>All Departments</span>
                      )}
                      <span className="text-muted" style={{ fontSize: "0.75rem", alignSelf: "center" }}>
                        🕐 {a.createdAt?.toDate().toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {isEditing ? (
                      <div>
                        <textarea className="form-control mb-2" rows={2} value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          style={{ fontSize: "0.9rem" }} autoFocus />
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" onClick={() => handleEditSave(a.id)}>💾 Save</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="fw-semibold mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                        {a.message}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="d-flex flex-column gap-1" style={{ flexShrink: 0 }}>
                      <button className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: "0.75rem", padding: "3px 10px" }}
                        onClick={() => { setEditingId(a.id); setEditMessage(a.message); }}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger"
                        style={{ fontSize: "0.75rem", padding: "3px 10px" }}
                        onClick={() => handleDelete(a.id)}>
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-muted text-end mt-3" style={{ fontSize: "0.8rem" }}>
          Showing {filtered.length} of {announcements.length} announcements
        </p>
      )}
    </div>
  );
}

export default Announcements;
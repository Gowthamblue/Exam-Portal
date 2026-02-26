import { useState } from "react";
import AdminCard from "../../components/AdminCard";

const Announcements = () => {
  const [announcementText, setAnnouncementText] = useState("");

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      message: "Mock test scheduled on Feb 15",
      date: "2026-02-03"
    },
    {
      id: 2,
      message: "New materials uploaded for CSE department",
      date: "2026-02-01"
    }
  ]);

  const handleAddAnnouncement = () => {
    if (!announcementText.trim()) {
      alert("Announcement cannot be empty");
      return;
    }

    const newAnnouncement = {
      id: announcements.length + 1,
      message: announcementText,
      date: new Date().toISOString().split("T")[0]
    };

    // Add new announcement at the top
    setAnnouncements([newAnnouncement, ...announcements]);
    setAnnouncementText("");
  };

  return (
    <AdminCard title="Announcements">

      {/* Add Announcement Section */}
      <div className="mb-4">
        <label className="form-label fw-semibold">
          Add New Announcement
        </label>

        <textarea
          className="form-control"
          rows="3"
          placeholder="Type announcement here..."
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
        />

        <div className="text-end">
          <button
            className="btn btn-primary mt-3"
            onClick={handleAddAnnouncement}
          >
            ➕ Post Announcement
          </button>
        </div>
      </div>

      <hr />

      {/* Announcement List */}
      <h5 className="mb-3">All Announcements</h5>

      {announcements.length === 0 ? (
        <p className="text-muted">No announcements posted yet.</p>
      ) : (
        announcements.map((a, index) => (
          <div
            key={a.id}
            className="p-3 mb-3 border rounded"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <p className="mb-1 fw-semibold">
                {index + 1}. {a.message}
              </p>
              <small className="text-muted">
                {a.date}
              </small>
            </div>
          </div>
        ))
      )}

    </AdminCard>
  );
};

export default Announcements;

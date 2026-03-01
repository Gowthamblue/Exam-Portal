import { useEffect, useState } from "react";
import AdminCard from "../../components/AdminCard";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase";

const departments = ["CSE", "ECE", "MECH"];

function Assessments() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formLink, setFormLink] = useState("");
  const [lastDate, setLastDate] = useState("");

  const fetchAssessments = async (dept) => {
    const q = query(
      collection(db, "assessments"),
      where("department", "==", dept)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setAssessments(data);
  };

  useEffect(() => {
    if (selectedDept) {
      fetchAssessments(selectedDept);
    }
  }, [selectedDept]);

  const handleAddAssessment = async () => {
    if (!title || !formLink || !lastDate) {
      alert("Fill all required fields");
      return;
    }

    await addDoc(collection(db, "assessments"), {
      title,
      description,
      formLink,
      lastDate,
      department: selectedDept,
      createdAt: new Date()
    });

    setTitle("");
    setDescription("");
    setFormLink("");
    setLastDate("");
    setShowForm(false);

    fetchAssessments(selectedDept);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this assessment?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "assessments", id));
    fetchAssessments(selectedDept);
  };

  return (
    <AdminCard title="Assessments">

      {/* Department Cards */}
      <div className="d-flex gap-3 mb-4">
        {departments.map((dept) => (
          <div
            key={dept}
            onClick={() => {
              setSelectedDept(dept);
              setShowForm(false);
            }}
            className="p-3 text-center shadow-sm"
            style={{
              cursor: "pointer",
              minWidth: "120px",
              borderRadius: "10px",
              backgroundColor:
                selectedDept === dept ? "#0d6efd" : "#f8f9fa",
              color: selectedDept === dept ? "#fff" : "#000",
              fontWeight: "600"
            }}
          >
            {dept}
          </div>
        ))}
      </div>

      {selectedDept && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{selectedDept} Assessments</h5>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              ➕ Add Assessment
            </button>
          </div>

          {/* Add Form */}
          {showForm && (
            <div className="border p-3 rounded mb-3">
              <input
                className="form-control mb-2"
                placeholder="Assessment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="form-control mb-2"
                placeholder="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="date"
                className="form-control mb-2"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
              />

              <input
                className="form-control mb-2"
                placeholder="Google Form Link"
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
              />

              <button
                className="btn btn-success"
                onClick={handleAddAssessment}
              >
                Save
              </button>
            </div>
          )}

          {/* Table */}
          {assessments.length === 0 ? (
            <p>No assessments available.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>S.No</th>
                    <th>Title</th>
                    <th>Last Date</th>
                    <th>Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a, index) => (
                    <tr key={a.id}>
                      <td>{index + 1}</td>
                      <td>{a.title}</td>
                      <td>{a.lastDate}</td>
                      <td>
                        <a
                          href={a.formLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(a.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminCard>
  );
}

export default Assessments;
import { useEffect, useState } from "react";
import AdminCard from "../../components/AdminCard";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  addDoc
} from "firebase/firestore";
import { db } from "../../firebase";

const departments = ["CSE", "ECE", "MECH"];

function Materials() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  // 🔹 Fetch materials (Removed orderBy to avoid index error)
  const fetchMaterials = async (dept) => {
    const q = query(
      collection(db, "materials"),
      where("department", "==", dept)
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setMaterials(data);
  };

  useEffect(() => {
    if (selectedDept) {
      fetchMaterials(selectedDept);
    }
  }, [selectedDept]);

  // 🔹 Add Material
  const handleAddMaterial = async () => {
    if (!description || !link) {
      alert("Please fill all fields");
      return;
    }

    await addDoc(collection(db, "materials"), {
      department: selectedDept,
      description,
      link,
      createdAt: new Date()
    });

    setDescription("");
    setLink("");
    setShowForm(false);

    fetchMaterials(selectedDept);
  };

  // 🔹 Delete Material
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this material?"
    );
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "materials", id));
    fetchMaterials(selectedDept);
  };

  return (
    <AdminCard title="Materials">

      {/* Department Selection */}
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

      {/* Materials Section */}
      {selectedDept && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{selectedDept} Materials</h5>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              ➕ Add Material
            </button>
          </div>

          {/* Add Form */}
          {showForm && (
            <div className="mb-3 p-3 border rounded">
              <input
                className="form-control mb-2"
                placeholder="Material Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                className="form-control mb-2"
                placeholder="Material Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />

              <button
                className="btn btn-success"
                onClick={handleAddMaterial}
              >
                Save
              </button>
            </div>
          )}

          {/* Table */}
          {materials.length === 0 ? (
            <p>No materials uploaded for this department.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>S.No</th>
                    <th>Description</th>
                    <th>Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, index) => (
                    <tr key={m.id}>
                      <td>{index + 1}</td>
                      <td>{m.description}</td>
                      <td>
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(m.id)}
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

export default Materials;
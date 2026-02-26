import { useState } from "react";
import AdminCard from "../../components/AdminCard";

const departments = ["CSE", "ECE", "MECH"];

const materialsData = {
  CSE: [
    {
      id: 1,
      date: "2026-02-05",
      description: "Operating Systems Notes",
      link: "https://drive.google.com/sample"
    }
  ],
  ECE: [
    {
      id: 1,
      date: "2026-02-08",
      description: "Signal Processing PDF",
      link: "https://icmasci.com/2026/"
    }
  ],
  MECH: []
};

const Materials = () => {
  const [selectedDept, setSelectedDept] = useState(null);

  return (
    <AdminCard title="Materials">
      
      {/* Department Selection */}
      <div className="d-flex gap-3 mb-4">
        {departments.map(dept => (
          <div
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className="p-3 text-center shadow-sm"
            style={{
              cursor: "pointer",
              minWidth: "120px",
              borderRadius: "10px",
              backgroundColor: selectedDept === dept ? "#198754" : "#f8f9fa",
              color: selectedDept === dept ? "#fff" : "#000",
              fontWeight: "600"
            }}
          >
            {dept}
          </div>
        ))}
      </div>

      {/* Table */}
      {selectedDept && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{selectedDept} Materials</h5>
            <button className="btn btn-success">
              ➕ Add Material
            </button>
          </div>

          {materialsData[selectedDept].length === 0 ? (
            <p>No materials available for this department.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {materialsData[selectedDept].map((m, index) => (
                    <tr key={m.id}>
                      <td>{index + 1}</td>
                      <td>{m.date}</td>
                      <td>{m.description}</td>
                      <td>
                        <a href={m.link} target="_blank" rel="noreferrer">
                          View
                        </a>
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
};

export default Materials;

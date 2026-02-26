import { useState } from "react";
import AdminCard from "../../components/AdminCard";

const departments = ["CSE", "ECE", "MECH"];

const assessmentsData = {
  CSE: [
    {
      id: 1,
      date: "2026-02-10",
      description: "Aptitude Test 1",
      link: "https://testlink.com"
    },
    {
      id: 2,
      date: "2026-02-15",
      description: "DSA Mock Test",
      link: "https://testlink.com"
    }
  ],
  ECE: [
    {
      id: 1,
      date: "2026-02-12",
      description: "Networks Test",
      link: "https://testlink.com"
    }
  ],
  MECH: []
};

const Assessments = () => {
  const [selectedDept, setSelectedDept] = useState(null);

  return (
    <AdminCard title="Assessments">
      
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
              backgroundColor: selectedDept === dept ? "#0d6efd" : "#f8f9fa",
              color: selectedDept === dept ? "#fff" : "#000",
              fontWeight: "600"
            }}
          >
            {dept}
          </div>
        ))}
      </div>

      {/* Table Section */}
      {selectedDept && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{selectedDept} Assessments</h5>
            <button className="btn btn-primary">
              ➕ Add Assessment
            </button>
          </div>

          {assessmentsData[selectedDept].length === 0 ? (
            <p>No assessments available for this department.</p>
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
                  {assessmentsData[selectedDept].map((a, index) => (
                    <tr key={a.id}>
                      <td>{index + 1}</td>
                      <td>{a.date}</td>
                      <td>{a.description}</td>
                      <td>
                        <a href={a.link} target="_blank" rel="noreferrer">
                          Open
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

export default Assessments;

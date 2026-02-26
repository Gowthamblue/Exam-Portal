import { useNavigate } from "react-router-dom";

const students = [
  {
    id: 1,
    name: "Arun Kumar",
    email: "arun@gmail.com",
    department: "CSE",
    phone: "9876543210"
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@gmail.com",
    department: "ECE",
    phone: "9123456789"
  }
];

const StudentsList = () => {
  const navigate = useNavigate();

  return (
    <>
      <h3 className="mb-4">Students</h3>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  <span className="badge bg-primary">
                    {s.department}
                  </span>
                </td>
                <td>{s.phone}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/admin/students/${s.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentsList;

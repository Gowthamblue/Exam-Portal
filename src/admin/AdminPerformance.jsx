import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import AdminCard from "../../components/AdminCard";

function AdminPerformance() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const snapshot = await getDocs(collection(db, "results"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResults(data);
    };

    fetchResults();
  }, []);

  return (
    <AdminCard title="Performance Monitoring">
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Register No</th>
            <th>Assessment</th>
            <th>Score</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td>{r.registerNumber}</td>
              <td>{r.assessmentTitle}</td>
              <td>{r.score}/{r.totalMarks}</td>
              <td>{r.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}

export default AdminPerformance;
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function StudentMaterials() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const department = userSnap.data().department;

      const q = query(
        collection(db, "materials"),
        where("department", "==", department)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMaterials(data);
    };

    fetchMaterials();
  }, []);

  return (
    <>
      <h3>Study Materials</h3>

      {materials.length === 0 ? (
        <p>No materials available.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Description</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, index) => (
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
      )}
    </>
  );
}

export default StudentMaterials;

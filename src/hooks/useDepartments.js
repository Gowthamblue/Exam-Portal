import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const q = query(collection(db, "departments"), orderBy("createdAt", "asc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => d.data().name);
      setDepartments(data);
    } catch {
      setDepartments(["CSE", "ECE", "MECH"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  return { departments, loading, refetch: fetchDepartments };
}
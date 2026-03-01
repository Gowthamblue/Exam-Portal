import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const [status, setStatus] = useState("loading"); // loading | authorized | unauthorized

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("unauthorized");
        return;
      }

      if (requiredRole) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().role === requiredRole) {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
        }
      } else {
        setStatus("authorized");
      }
    });

    return () => unsubscribe();
  }, [requiredRole]);

  if (status === "loading") {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Checking access...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
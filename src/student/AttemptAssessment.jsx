import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

function AttemptAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [student, setStudent] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: "A" }
  const [stage, setStage] = useState("loading"); // loading | intro | attempt | submitted | alreadyDone
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/");

      // Fetch student
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) return;
      const studentData = userSnap.data();
      setStudent(studentData);

      // Fetch assessment
      const assessSnap = await getDoc(doc(db, "aiAssessments", id));
      if (!assessSnap.exists()) return navigate("/student/assessments");
      const assessData = { id: assessSnap.id, ...assessSnap.data() };
      setAssessment(assessData);

      // Check if already attempted
      const existingQ = query(
        collection(db, "results"),
        where("registerNumber", "==", studentData.registerNumber),
        where("assessmentId", "==", id)
      );
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        const existingResult = existingSnap.docs[0].data();
        setResult(existingResult);
        setStage("alreadyDone");
        return;
      }

      // Set timer: 2 min per question
      setTimeLeft(assessData.questions.length * 120);
      setStage("intro");
    };

    fetchData();
  }, [id]);

  // Timer
  useEffect(() => {
    if (stage !== "attempt") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    clearInterval(timerRef.current);

    const questions = assessment.questions;
    let correct = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const score = correct;
    const totalMarks = questions.length;
    const percentage = Math.round((score / totalMarks) * 100);

    const resultData = {
      registerNumber: student.registerNumber,
      studentName: student.name,
      department: student.department,
      assessmentId: id,
      assessmentTitle: assessment.title,
      score,
      totalMarks,
      percentage,
      answers,
      submittedAt: new Date(),
      autoSubmitted: autoSubmit,
    };

    await addDoc(collection(db, "results"), resultData);
    setResult(resultData);
    setStage("submitted");
  };

  const answeredCount = Object.keys(answers).length;
  const totalQ = assessment?.questions?.length || 0;
  const timerWarning = timeLeft < 120;

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading assessment...</p>
      </div>
    );
  }

  // ── ALREADY DONE ──────────────────────────────────────────────────────────
  if (stage === "alreadyDone") {
    const badge =
      result.percentage >= 80
        ? { color: "#198754", bg: "#e6f9ef", label: "Excellent" }
        : result.percentage >= 50
        ? { color: "#c8960c", bg: "#fff8e1", label: "Good" }
        : { color: "#dc3545", bg: "#fde8e8", label: "Needs Work" };

    return (
      <div className="text-center py-4">
        <div style={{ fontSize: "3rem" }}>📋</div>
        <h5 className="mt-2 fw-bold">Already Attempted</h5>
        <p className="text-muted">You have already submitted this assessment.</p>
        <div
          className="mx-auto p-4 rounded-3 mt-3"
          style={{ maxWidth: 320, backgroundColor: badge.bg, border: `1px solid ${badge.color}33` }}
        >
          <div className="fw-bold" style={{ fontSize: "2.5rem", color: badge.color }}>
            {result.percentage}%
          </div>
          <div style={{ color: badge.color }}>{badge.label}</div>
          <div className="text-muted mt-1" style={{ fontSize: "0.9rem" }}>
            {result.score} / {result.totalMarks} correct
          </div>
        </div>
        <button className="btn btn-outline-primary mt-4" onClick={() => navigate("/student/assessments")}>
          ← Back to Assessments
        </button>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (stage === "intro") {
    return (
      <div className="text-center py-4" style={{ maxWidth: 500, margin: "0 auto" }}>
        <div
          className="mx-auto mb-4 d-flex align-items-center justify-content-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: "18px",
            background: "linear-gradient(135deg, #0f2544, #1a56db)",
            fontSize: "2rem",
          }}
        >
          📝
        </div>
        <h4 className="fw-bold">{assessment.title}</h4>
        <p className="text-muted mb-4">{assessment.department} Department</p>

        <div className="row g-3 mb-4">
          {[
            { icon: "❓", label: "Questions", value: totalQ },
            { icon: "⏱️", label: "Time Limit", value: `${totalQ * 2} mins` },
            { icon: "🏆", label: "Total Marks", value: totalQ },
          ].map((info) => (
            <div className="col-4" key={info.label}>
              <div
                className="p-3 rounded-3"
                style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}
              >
                <div style={{ fontSize: "1.4rem" }}>{info.icon}</div>
                <div className="fw-bold mt-1" style={{ color: "#1e40af" }}>
                  {info.value}
                </div>
                <div className="text-muted small">{info.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="text-start p-3 rounded-3 mb-4"
          style={{ backgroundColor: "#fffbeb", border: "1px solid #fbbf24", fontSize: "0.88rem" }}
        >
          <p className="fw-semibold mb-1">📌 Instructions</p>
          <ul className="mb-0 ps-3" style={{ lineHeight: "1.8" }}>
            <li>Each question carries 1 mark. No negative marking.</li>
            <li>You can navigate between questions freely.</li>
            <li>Timer auto-submits when time runs out.</li>
            <li>You <strong>cannot</strong> attempt this test again after submission.</li>
          </ul>
        </div>

        <button
          className="btn btn-lg fw-bold px-5"
          style={{
            background: "linear-gradient(135deg, #1a56db, #7c3aed)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
          }}
          onClick={() => setStage("attempt")}
        >
          Start Test →
        </button>
      </div>
    );
  }

  // ── SUBMITTED ─────────────────────────────────────────────────────────────
  if (stage === "submitted") {
    const badge =
      result.percentage >= 80
        ? { color: "#198754", bg: "#e6f9ef", label: "Excellent! 🏆", msg: "Outstanding performance! You're well prepared." }
        : result.percentage >= 50
        ? { color: "#c8960c", bg: "#fff8e1", label: "Good Work 💪", msg: "Solid performance. Keep practicing to improve further." }
        : { color: "#dc3545", bg: "#fde8e8", label: "Keep Going 📖", msg: "Review the materials and try more practice tests." };

    const questions = assessment.questions;

    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Score card */}
        <div
          className="rounded-3 p-4 mb-4 text-center"
          style={{ background: "linear-gradient(135deg, #0f2544, #1a56db)", color: "#fff" }}
        >
          <div style={{ fontSize: "3rem" }}>
            {result.percentage >= 80 ? "🏆" : result.percentage >= 50 ? "💪" : "📖"}
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1.1 }}>
            {result.percentage}%
          </div>
          <div className="opacity-75">{result.score} / {result.totalMarks} correct</div>
          <div
            className="mt-2 mx-auto px-3 py-1 rounded-pill d-inline-block"
            style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 600, fontSize: "0.9rem" }}
          >
            {badge.label}
          </div>
          <p className="mt-2 opacity-75 mb-0" style={{ fontSize: "0.9rem" }}>{badge.msg}</p>
        </div>

        {/* Answer review */}
        <h6 className="fw-bold mb-3">Answer Review</h6>
        <div className="d-flex flex-column gap-3 mb-4">
          {questions.map((q, i) => {
            const chosen = result.answers[q.id];
            const isCorrect = chosen === q.correctAnswer;
            return (
              <div
                key={q.id}
                className="rounded-3 p-3"
                style={{
                  border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`,
                  backgroundColor: isCorrect ? "#f0fdf4" : "#fff5f5",
                }}
              >
                <div className="d-flex gap-2 mb-2">
                  <span className="fw-bold" style={{ color: isCorrect ? "#16a34a" : "#dc2626" }}>
                    {isCorrect ? "✓" : "✗"} Q{i + 1}.
                  </span>
                  <span style={{ fontSize: "0.9rem" }}>{q.question}</span>
                </div>
                <div className="d-flex gap-3 flex-wrap" style={{ fontSize: "0.83rem" }}>
                  {!isCorrect && chosen && (
                    <span style={{ color: "#dc2626" }}>
                      Your answer: <strong>{chosen}. {q.options[chosen]}</strong>
                    </span>
                  )}
                  {!isCorrect && !chosen && (
                    <span style={{ color: "#94a3b8" }}>Not answered</span>
                  )}
                  <span style={{ color: "#16a34a" }}>
                    Correct: <strong>{q.correctAnswer}. {q.options[q.correctAnswer]}</strong>
                  </span>
                </div>
                {q.explanation && (
                  <div className="mt-2" style={{ fontSize: "0.82rem", color: "#78350f" }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="d-flex gap-3 justify-content-center">
          <button className="btn btn-outline-primary" onClick={() => navigate("/student/assessments")}>
            ← Assessments
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/student")}>
            View Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── ATTEMPT ───────────────────────────────────────────────────────────────
  const questions = assessment.questions;
  const q = questions[currentQ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Top bar */}
      <div
        className="d-flex justify-content-between align-items-center p-3 rounded-3 mb-4 sticky-top"
        style={{
          background: "linear-gradient(135deg, #0f2544, #1a56db)",
          color: "#fff",
          zIndex: 10,
          top: 0,
        }}
      >
        <div>
          <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{assessment.title}</div>
          <div className="opacity-75" style={{ fontSize: "0.8rem" }}>
            {answeredCount}/{totalQ} answered
          </div>
        </div>
        <div
          className="fw-bold px-3 py-1 rounded-2"
          style={{
            backgroundColor: timerWarning ? "#dc2626" : "rgba(255,255,255,0.15)",
            fontSize: "1.1rem",
            fontFamily: "monospace",
            animation: timerWarning ? "blink 1s infinite" : "none",
          }}
        >
          ⏱ {formatTime(timeLeft)}
        </div>
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>

      {/* Question navigator */}
      <div className="d-flex flex-wrap gap-1 mb-4">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className="btn btn-sm"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.8rem",
              backgroundColor:
                currentQ === i
                  ? "#1a56db"
                  : answers[questions[i].id]
                  ? "#dcfce7"
                  : "#f1f5f9",
              color:
                currentQ === i
                  ? "#fff"
                  : answers[questions[i].id]
                  ? "#16a34a"
                  : "#64748b",
              border:
                currentQ === i
                  ? "none"
                  : answers[questions[i].id]
                  ? "1px solid #86efac"
                  : "1px solid #e2e8f0",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div
        className="p-4 rounded-3 mb-4"
        style={{ border: "1px solid #e2e8f0", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="d-flex gap-2 mb-3">
          <span
            className="badge"
            style={{ backgroundColor: "#1a56db", fontSize: "0.8rem" }}
          >
            Q{currentQ + 1} of {totalQ}
          </span>
          <span className="badge bg-secondary" style={{ fontSize: "0.8rem" }}>
            1 Mark
          </span>
        </div>
        <p className="fw-semibold mb-4" style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
          {q.question}
        </p>

        <div className="d-flex flex-column gap-2">
          {["A", "B", "C", "D"].map((opt) => {
            const chosen = answers[q.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                className="text-start p-3 rounded-3 d-flex align-items-center gap-3"
                style={{
                  border: `2px solid ${chosen ? "#1a56db" : "#e2e8f0"}`,
                  backgroundColor: chosen ? "#eff6ff" : "#fafafa",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontWeight: chosen ? 600 : 400,
                  color: chosen ? "#1e40af" : "#374151",
                  fontSize: "0.95rem",
                }}
              >
                <span
                  className="d-flex align-items-center justify-content-center fw-bold rounded-2"
                  style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    backgroundColor: chosen ? "#1a56db" : "#e2e8f0",
                    color: chosen ? "#fff" : "#64748b",
                    fontSize: "0.85rem",
                  }}
                >
                  {opt}
                </span>
                {q.options[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="d-flex justify-content-between align-items-center">
        <button
          className="btn btn-outline-secondary"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((p) => p - 1)}
        >
          ← Prev
        </button>

        {currentQ < totalQ - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentQ((p) => p + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn fw-bold px-4"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
            }}
            onClick={() => {
              if (
                answeredCount < totalQ &&
                !window.confirm(
                  `You have ${totalQ - answeredCount} unanswered question(s). Submit anyway?`
                )
              )
                return;
              handleSubmit();
            }}
          >
            ✓ Submit Test ({answeredCount}/{totalQ})
          </button>
        )}
      </div>
    </div>
  );
}

export default AttemptAssessment;
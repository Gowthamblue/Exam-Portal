import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useDepartments } from "../../hooks/useDepartments";


// ── PDF text extraction using pdf.js (loaded from CDN) ────────────────────

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return window.pdfjsLib;
}

async function extractTextFromFile(file) {
  if (file.type === "text/plain") {
    return await file.text();
  }

  if (file.type === "application/pdf") {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    if (!fullText.trim()) {
      throw new Error(
        "Could not extract text from this PDF. Try a text-based PDF (not a scanned image)."
      );
    }

    return fullText;
  }

  throw new Error("Unsupported file type. Please upload a PDF or .txt file.");
}

// ── Groq API MCQ generation (Free — no credit card needed) ──────────────────

async function generateMCQsWithGemini(text, topic, count = 15) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Groq API key not found. Add VITE_GROQ_API_KEY=your_key to your .env file."
    );
  }

  const systemPrompt = `You are an expert educational assessment creator specializing in competitive exam preparation (GATE, placements, government exams).
Your task: Read the provided study material and generate exactly ${count} high-quality multiple-choice questions (MCQs).
STRICT OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no explanation:
{
  "title": "Assessment title based on the material topic",
  "questions": [
    {
      "id": 1,
      "question": "Clear, precise question text",
      "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
      "correctAnswer": "A",
      "explanation": "Brief explanation"
    }
  ]
}
Rules:
- Questions must come directly from the material
- Distractors must be plausible but clearly incorrect
- Difficulty mix: 40% easy, 40% medium, 20% hard
- No duplicate questions
- correctAnswer must be exactly "A", "B", "C", or "D"
- Generate exactly ${count} questions`;

  const userMessage = `Study Material:\n${text.slice(0, 20000)}\n\nTopic: "${topic}"\n\nGenerate ${count} MCQs. Return ONLY the JSON object.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    const msg = err?.error?.message || "Groq API error";
    if (msg.includes("invalid_api_key"))
      throw new Error("Invalid Groq API key. Check your .env file.");
    if (msg.includes("rate_limit"))
      throw new Error("Groq rate limit hit. Wait a few seconds and try again.");
    throw new Error(msg);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "";

  // Strip markdown fences if present
  const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Groq returned invalid JSON. Please try again.");
  }
}

// ── Stages ─────────────────────────────────────────────────────────────────

const STAGES = {
  IDLE: "idle",
  EXTRACTING: "extracting",
  GENERATING: "generating",
  PREVIEW: "preview",
  SAVING: "saving",
  DONE: "done",
};

// ── Component ──────────────────────────────────────────────────────────────

function AIAssessmentGenerator() {
  const { departments } = useDepartments();
  const [stage, setStage] = useState(STAGES.IDLE);
  const [file, setFile] = useState(null);
  const [manualText, setManualText] = useState("");
  const [inputMode, setInputMode] = useState("file"); // file | text
  const [topic, setTopic] = useState("");
  const [department, setDepartment] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [lastDate, setLastDate] = useState("");
  const [generated, setGenerated] = useState(null); // { title, questions }
  const [error, setError] = useState("");
  const [editingQ, setEditingQ] = useState(null); // index of question being edited
  const [progress, setProgress] = useState("");

  const canGenerate =
    department &&
    topic.trim() &&
    lastDate &&
    (inputMode === "file" ? file !== null : manualText.trim().length > 100);

  const handleGenerate = async () => {
    setError("");
    try {
      setStage(STAGES.EXTRACTING);
      setProgress("Reading your material...");

      let content;
      if (inputMode === "file") {
        content = await extractTextFromFile(file);
      } else {
        content = manualText;
      }

      setStage(STAGES.GENERATING);
      setProgress(`Groq AI is analysing the content and generating ${questionCount} MCQs...`);

      const result = await generateMCQsWithGemini(content, topic, questionCount);

      setGenerated(result);
      setStage(STAGES.PREVIEW);
      setProgress("");
    } catch (err) {
      setError(err.message);
      setStage(STAGES.IDLE);
    }
  };

  const handleSaveToFirestore = async () => {
    setStage(STAGES.SAVING);
    try {
      await addDoc(collection(db, "aiAssessments"), {
        title: generated.title,
        department,
        topic,
        lastDate,
        questionCount: generated.questions.length,
        questions: generated.questions,
        createdAt: new Date(),
        type: "ai-generated",
      });
      setStage(STAGES.DONE);
    } catch (err) {
      setError(err.message);
      setStage(STAGES.PREVIEW);
    }
  };

  const handleReset = () => {
    setStage(STAGES.IDLE);
    setFile(null);
    setManualText("");
    setTopic("");
    setDepartment("");
    setLastDate("");
    setGenerated(null);
    setError("");
    setEditingQ(null);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...generated.questions];
    if (field.startsWith("option_")) {
      const opt = field.split("_")[1];
      updated[index] = {
        ...updated[index],
        options: { ...updated[index].options, [opt]: value },
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setGenerated({ ...generated, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = generated.questions.filter((_, i) => i !== index);
    setGenerated({ ...generated, questions: updated });
  };

  // ── DONE screen ───────────────────────────────────────────────────────────
  if (stage === STAGES.DONE) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: "4rem" }}>✅</div>
        <h4 className="mt-3 fw-bold">Assessment Created Successfully!</h4>
        <p className="text-muted">
          <strong>{generated?.title}</strong> has been saved to Firestore.
          <br />
          {generated?.questions?.length} questions are now available for {department} students.
        </p>
        <div className="d-flex gap-3 justify-content-center mt-4">
          <button className="btn btn-primary" onClick={handleReset}>
            ➕ Generate Another
          </button>
        </div>
      </div>
    );
  }

  // ── PREVIEW screen ────────────────────────────────────────────────────────
  if (stage === STAGES.PREVIEW && generated) {
    return (
      <div>
        {/* Header */}
        <div
          className="rounded-3 p-4 mb-4 text-white"
          style={{ background: "linear-gradient(135deg, #0f2544, #1a56db)" }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <span
                className="badge mb-2"
                style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}
              >
                🤖 AI Generated
              </span>
              <h4 className="mb-1 fw-bold">{generated.title}</h4>
              <p className="mb-0 opacity-75">
                {department} &nbsp;·&nbsp; {generated.questions.length} Questions &nbsp;·&nbsp; Due: {lastDate}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-light"
                onClick={handleReset}
              >
                ✕ Discard
              </button>
              <button
                className="btn btn-sm btn-warning fw-bold"
                onClick={handleSaveToFirestore}
              >
                💾 Save to Firestore
              </button>
            </div>
          </div>
        </div>

        <p className="text-muted small mb-3">
          Review and edit questions before saving. Click any question to edit it.
        </p>

        {/* Questions */}
        <div className="d-flex flex-column gap-3">
          {generated.questions.map((q, i) => (
            <div
              key={i}
              className="rounded-3 p-3"
              style={{
                border: "1px solid #e2e8f0",
                backgroundColor: editingQ === i ? "#f0f7ff" : "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {/* Question header */}
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span
                  className="badge me-2 mt-1"
                  style={{ backgroundColor: "#1a56db", minWidth: "32px" }}
                >
                  Q{i + 1}
                </span>

                <div className="flex-grow-1">
                  {editingQ === i ? (
                    <textarea
                      className="form-control form-control-sm mb-2"
                      value={q.question}
                      onChange={(e) => updateQuestion(i, "question", e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <p className="mb-0 fw-semibold" style={{ fontSize: "0.95rem" }}>
                      {q.question}
                    </p>
                  )}
                </div>

                <div className="d-flex gap-1 ms-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                    onClick={() => setEditingQ(editingQ === i ? null : i)}
                  >
                    {editingQ === i ? "Done" : "✏️"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                    onClick={() => removeQuestion(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="row g-2 mt-1">
                {["A", "B", "C", "D"].map((opt) => (
                  <div className="col-6" key={opt}>
                    <div
                      className="p-2 rounded-2 d-flex align-items-center gap-2"
                      style={{
                        backgroundColor:
                          q.correctAnswer === opt ? "#e6f9ef" : "#f8f9fa",
                        border: `1px solid ${q.correctAnswer === opt ? "#198754" : "#e2e8f0"}`,
                        fontSize: "0.85rem",
                      }}
                    >
                      <span
                        className="fw-bold"
                        style={{
                          color: q.correctAnswer === opt ? "#198754" : "#64748b",
                          minWidth: "18px",
                        }}
                      >
                        {opt}.
                      </span>
                      {editingQ === i ? (
                        <input
                          className="form-control form-control-sm"
                          style={{ fontSize: "0.82rem" }}
                          value={q.options[opt]}
                          onChange={(e) =>
                            updateQuestion(i, `option_${opt}`, e.target.value)
                          }
                        />
                      ) : (
                        <span>{q.options[opt]}</span>
                      )}
                      {q.correctAnswer === opt && (
                        <span className="ms-auto text-success fw-bold">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Correct answer selector when editing */}
              {editingQ === i && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <small className="text-muted">Correct answer:</small>
                  {["A", "B", "C", "D"].map((opt) => (
                    <button
                      key={opt}
                      className={`btn btn-sm ${q.correctAnswer === opt ? "btn-success" : "btn-outline-secondary"}`}
                      style={{ padding: "2px 10px", fontSize: "0.8rem" }}
                      onClick={() => updateQuestion(i, "correctAnswer", opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Explanation */}
              {q.explanation && (
                <div
                  className="mt-2 p-2 rounded-2"
                  style={{
                    backgroundColor: "#fffbeb",
                    borderLeft: "3px solid #f59e0b",
                    fontSize: "0.82rem",
                    color: "#78350f",
                  }}
                >
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom save bar */}
        <div
          className="mt-4 p-3 rounded-3 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#f0f7ff", border: "1px solid #bfdbfe" }}
        >
          <p className="mb-0 text-primary fw-semibold">
            {generated.questions.length} questions ready to save for {department} students
          </p>
          <button
            className="btn btn-primary fw-bold px-4"
            onClick={handleSaveToFirestore}
            disabled={stage === STAGES.SAVING}
          >
            {stage === STAGES.SAVING ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              "💾 Save Assessment"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── GENERATING / EXTRACTING screens ───────────────────────────────────────
  if (stage === STAGES.EXTRACTING || stage === STAGES.GENERATING) {
    return (
      <div className="text-center py-5">
        <div style={{ position: "relative", display: "inline-block", marginBottom: "1.5rem" }}>
          {/* Animated rings */}
          {[80, 100, 120].map((size, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: size,
                height: size,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: `rgba(26, 86, 219, ${0.3 - i * 0.08})`,
                animation: `pulse ${1.2 + i * 0.3}s ease-in-out infinite`,
              }}
            />
          ))}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a56db, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            🤖
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
          }
        `}</style>

        <h5 className="fw-bold mt-2">
          {stage === STAGES.EXTRACTING ? "Reading Material..." : "Generating MCQs with AI..."}
        </h5>
        <p className="text-muted">{progress}</p>

        {stage === STAGES.GENERATING && (
          <div className="mt-3" style={{ maxWidth: 400, margin: "0 auto" }}>
            <div className="progress" style={{ height: 6, borderRadius: 99 }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                style={{ width: "100%", background: "linear-gradient(90deg, #1a56db, #7c3aed)" }}
              />
            </div>
            <small className="text-muted mt-2 d-block">
              Identifying key concepts → Generating questions → Forming options...
            </small>
          </div>
        )}
      </div>
    );
  }

  // ── IDLE / INPUT screen ───────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div
        className="rounded-3 p-4 mb-4"
        style={{ background: "linear-gradient(135deg, #0f2544, #1a56db)", color: "#fff" }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            🤖
          </div>
          <div>
            <h5 className="mb-0 fw-bold">AI Assessment Generator</h5>
            <p className="mb-0 opacity-75" style={{ fontSize: "0.85rem" }}>
              Upload study material → Claude AI reads it → MCQs generated automatically
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Pipeline steps visual */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        {[
          { icon: "📄", label: "Upload Material" },
          { icon: "→", label: "" },
          { icon: "🤖", label: "Claude Reads & Analyses" },
          { icon: "→", label: "" },
          { icon: "📝", label: "MCQs Generated" },
          { icon: "→", label: "" },
          { icon: "🔥", label: "Saved to Firestore" },
        ].map((step, i) =>
          step.label === "" ? (
            <span key={i} className="text-muted">→</span>
          ) : (
            <div
              key={i}
              className="px-3 py-2 rounded-2 text-center"
              style={{
                backgroundColor: "#f0f7ff",
                border: "1px solid #bfdbfe",
                fontSize: "0.8rem",
                color: "#1e40af",
                fontWeight: 600,
              }}
            >
              <div>{step.icon}</div>
              <div>{step.label}</div>
            </div>
          )
        )}
      </div>

      {/* Form */}
      <div className="row g-4">
        {/* LEFT — Config */}
        <div className="col-md-5">
          <div
            className="p-4 rounded-3"
            style={{ border: "1px solid #e2e8f0", backgroundColor: "#fafafa" }}
          >
            <h6 className="fw-bold mb-3">Assessment Settings</h6>

            {/* Department */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                Department *
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {departments.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepartment(d)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: department === d ? "#1a56db" : "#f1f5f9",
                      color: department === d ? "#fff" : "#374151",
                      border: department === d ? "none" : "1px solid #d1d5db",
                      borderRadius: "20px",
                      fontWeight: department === d ? "600" : "400",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                Topic / Subject Name *
              </label>
              <input
                className="form-control"
                placeholder="e.g. Operating Systems, Data Structures..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <small className="text-muted">Helps Groq AI focus question generation</small>
            </div>

            {/* Last date */}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                Assessment Last Date *
              </label>
              <input
                type="date"
                className="form-control"
                value={lastDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setLastDate(e.target.value)}
              />
            </div>

            {/* Question count */}
            <div className="mb-0">
              <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                Number of Questions: <strong>{questionCount}</strong>
              </label>
              <input
                type="range"
                className="form-range"
                min={20}
                max={50}
                step={5}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between">
                <small className="text-muted">20</small>
                <small className="text-muted">25</small>
                <small className="text-muted">30</small>
                <small className="text-muted">35</small>
                <small className="text-muted">40</small>
                <small className="text-muted">45</small>
                <small className="text-muted">50</small>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Material input */}
        <div className="col-md-7">
          <div
            className="p-4 rounded-3 h-100"
            style={{ border: "1px solid #e2e8f0", backgroundColor: "#fafafa" }}
          >
            <h6 className="fw-bold mb-3">Study Material</h6>

            {/* Mode toggle */}
            <div
              className="d-flex mb-3 p-1 rounded-2"
              style={{ backgroundColor: "#e2e8f0", width: "fit-content" }}
            >
              {["file", "text"].map((mode) => (
                <button
                  key={mode}
                  className="btn btn-sm"
                  onClick={() => setInputMode(mode)}
                  style={{
                    backgroundColor: inputMode === mode ? "#fff" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: inputMode === mode ? "600" : "400",
                    color: inputMode === mode ? "#1e40af" : "#64748b",
                    padding: "4px 16px",
                    boxShadow: inputMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {mode === "file" ? "📎 Upload File" : "✏️ Paste Text"}
                </button>
              ))}
            </div>

            {inputMode === "file" ? (
              <div>
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  className="rounded-3 d-flex flex-column align-items-center justify-content-center"
                  style={{
                    border: `2px dashed ${file ? "#1a56db" : "#cbd5e1"}`,
                    backgroundColor: file ? "#f0f7ff" : "#fff",
                    cursor: "pointer",
                    padding: "2.5rem 1rem",
                    transition: "all 0.2s",
                    minHeight: "180px",
                  }}
                >
                  <div style={{ fontSize: "2.5rem" }}>{file ? "📄" : "📁"}</div>
                  {file ? (
                    <>
                      <p className="fw-semibold text-primary mb-1 mt-2">{file.name}</p>
                      <small className="text-muted">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </small>
                    </>
                  ) : (
                    <>
                      <p className="fw-semibold mt-2 mb-1">Drop your file here</p>
                      <small className="text-muted">Supports PDF and .txt files</small>
                    </>
                  )}
                </div>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.txt"
                  className="d-none"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </div>
            ) : (
              <div>
                <textarea
                  className="form-control"
                  rows={9}
                  placeholder="Paste your study notes, textbook content, or any learning material here...

Minimum 100 characters required. The more content you provide, the better the questions will be."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  style={{ resize: "vertical", fontSize: "0.9rem" }}
                />
                <small className="text-muted">
                  {manualText.length} characters
                  {manualText.length < 100 && manualText.length > 0 && (
                    <span className="text-danger"> (need at least 100)</span>
                  )}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="mt-4 text-center">
        <button
          className="btn btn-lg fw-bold px-5"
          style={{
            background: canGenerate
              ? "linear-gradient(135deg, #1a56db, #7c3aed)"
              : "#e2e8f0",
            color: canGenerate ? "#fff" : "#94a3b8",
            border: "none",
            borderRadius: "12px",
            padding: "14px 48px",
            fontSize: "1rem",
            boxShadow: canGenerate ? "0 4px 20px rgba(26,86,219,0.35)" : "none",
            transition: "all 0.2s",
            cursor: canGenerate ? "pointer" : "not-allowed",
          }}
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          🤖 Generate MCQs with AI
        </button>
        {!canGenerate && (
          <p className="text-muted mt-2" style={{ fontSize: "0.85rem" }}>
            Fill in all fields and upload material to continue
          </p>
        )}
      </div>
    </div>
  );
}

export default AIAssessmentGenerator;
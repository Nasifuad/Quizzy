import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [msg, setMsg] = useState("");
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const autosaveRef = useRef(null);
  const timerRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [flagged, setFlagged] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const api = (await import("../api.js")).default;
        const data = await api.apiFetch(`/api/exams/${id}/start`, {
          method: "POST",
        });
        setExam({ ...data, questions: data.questions });
        setAttemptId(data.attemptId);
        if (data?.durationMinutes) setSecondsLeft(data.durationMinutes * 60);
      } catch (err) {
        setMsg(err.message || "Failed to load exam");
      }
    })();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (secondsLeft == null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (!exam) return;
      const tgt = e.target;
      const tag = tgt && tgt.tagName && tgt.tagName.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tgt.isContentEditable)
        return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setIndex((i) => Math.min(exam.questions.length - 1, i + 1));
        e.preventDefault();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setIndex((i) => Math.max(0, i - 1));
        e.preventDefault();
      } else if (/^[a-d]$/i.test(e.key)) {
        const idx = e.key.toUpperCase().charCodeAt(0) - 65;
        select(exam.questions[index]._id, idx);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exam, index]);

  function padOptions(opts) {
    const out = Array.from(opts || []);
    while (out.length < 4) out.push("---");
    return out.slice(0, 4);
  }

  function select(qid, idx) {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  }

  function toggleFlag(qid) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  function formatTime(s) {
    if (s == null) return "";
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  async function submit(final = true, silent = false) {
    if (!exam) return;
    setSubmitting(true);
    const payload = {
      attemptId,
      answers: exam.questions.map((q) => ({
        question: q._id,
        selectedIndex:
          typeof answers[q._id] === "number" ? answers[q._id] : null,
      })),
      durationSeconds: exam.durationMinutes
        ? exam.durationMinutes * 60 - (secondsLeft || 0)
        : 0,
    };
    try {
      const api = (await import("../api.js")).default;
      const data = await api.apiFetch(`/api/exams/${id}/attempts`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!silent) {
        setMsg(final ? `Submitted! Score: ${data.score}%` : "✓ Progress saved");
      }
      return data;
    } catch (err) {
      if (!silent) setMsg(err.message || "Error submitting attempt");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAutoSubmit() {
    setMsg("⏱ Time is up — submitting...");
    const data = await submit(true);
    if (data?.attemptId) {
      setTimeout(() => navigate(`/result/${data.attemptId}`), 500);
    }
  }

  // Autosave every 30 seconds
  useEffect(() => {
    if (!attemptId) return;
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      submit(false, true);
    }, 30 * 1000);
    return () => clearInterval(autosaveRef.current);
  }, [attemptId]);

  if (!exam) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f6f8fa",
        }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #0070f3",
              borderTop: "3px solid #f6f8fa",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div>{msg || "Loading exam..."}</div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  const q = exam.questions[index];
  const opts = padOptions(q.options);
  const answered = exam.questions.filter(
    (qq) => typeof answers[qq._id] === "number"
  ).length;
  const totalTime = exam.durationMinutes ? exam.durationMinutes * 60 : null;
  const timePercent = totalTime
    ? Math.max(0, (secondsLeft / totalTime) * 100)
    : 100;
  const isLowTime = secondsLeft !== null && secondsLeft < 300;

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .exam-wrapper { display: grid; grid-template-columns: 280px 1fr 320px; gap: 16px; height: 100vh; overflow: hidden; }
        .exam-wrapper > * { display: flex; flex-direction: column; }
        .exam-left, .exam-right { border-right: 1px solid #e5e7eb; overflow-y: auto; }
        .exam-center { overflow-y: auto; }
        @media (max-width: 1200px) { .exam-wrapper { grid-template-columns: 1fr; } .exam-left, .exam-right { display: none; } }
      `}</style>

      <div className="exam-wrapper" style={{ backgroundColor: "#f6f8fa" }}>
        {/* LEFT SIDEBAR */}
        <div
          className="exam-left card"
          style={{ margin: "16px", marginRight: "0", borderRadius: "12px" }}
        >
          <div
            style={{ paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "4px",
              }}
            >
              Progress
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>
              {answered} / {exam.questions.length}
            </div>
          </div>

          <div style={{ marginTop: "16px", flex: 1, overflow: "auto" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              QUESTIONS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              {exam.questions.map((qq, i) => {
                const qid = qq._id;
                const isAnswered = typeof answers[qid] === "number";
                const isFlagged = flagged.has(qid);
                const isCurrent = i === index;

                return (
                  <button
                    key={qid}
                    onClick={() => setIndex(i)}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: isCurrent
                        ? "2px solid #0070f3"
                        : "1px solid #e5e7eb",
                      background: isCurrent
                        ? "#f0f7ff"
                        : isAnswered
                        ? "#f0fdf4"
                        : "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: isCurrent ? "700" : "600",
                      color: isCurrent ? "#0070f3" : "#333",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                    title={isFlagged ? "Flagged for review" : ""}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          fontSize: "10px",
                        }}
                      >
                        🚩
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid #e5e7eb",
              marginTop: "12px",
            }}
          >
            <button
              onClick={() => setShowHints(!showHints)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              {showHints ? "✓ Hints" : "Tips"}
            </button>
          </div>
        </div>

        {/* CENTER */}
        <div
          className="exam-center"
          style={{ padding: "24px", maxWidth: "900px" }}
        >
          {totalTime && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  height: "4px",
                  background: "#e5e7eb",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${timePercent}%`,
                    background: isLowTime ? "#ef4444" : "#10b981",
                    transition: "width 1s linear, background 0.3s",
                  }}
                />
              </div>
            </div>
          )}

          <div
            className="card"
            style={{
              animation: "slideIn 0.3s ease",
              marginBottom: "24px",
              padding: "28px",
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                Question {index + 1} of {exam.questions.length}
              </div>
              <button
                onClick={() => toggleFlag(q._id)}
                style={{
                  background: flagged.has(q._id) ? "#fff3cd" : "white",
                  border: flagged.has(q._id)
                    ? "1px solid #ffc107"
                    : "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: flagged.has(q._id) ? "#856404" : "#6b7280",
                }}
              >
                {flagged.has(q._id) ? "🚩 Flagged" : "🚩 Flag"}
              </button>
            </div>

            <h2
              style={{ margin: "16px 0", fontSize: "20px", lineHeight: "1.6" }}
            >
              {q.text}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {opts.map((opt, idx) => {
                const isSelected = answers[q._id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => select(q._id, idx)}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: isSelected
                        ? "2px solid #0070f3"
                        : "1px solid #e5e7eb",
                      background: isSelected ? "#f0f7ff" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      transform: isSelected ? "scale(0.98)" : "scale(1)",
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) e.target.style.borderColor = "#0070f3";
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) e.target.style.borderColor = "#e5e7eb";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isSelected ? "#0070f3" : "#f0f0f0",
                          color: isSelected ? "white" : "#666",
                          fontWeight: "700",
                          fontSize: "14px",
                        }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "14px",
                          color: isSelected ? "#0070f3" : "#333",
                        }}
                      >
                        {opt}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showHints && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "#f0fdf4",
                  borderLeft: "4px solid #10b981",
                  fontSize: "13px",
                  color: "#065f46",
                }}
              >
                💡 <strong>Tip:</strong> Use keyboard shortcuts: A-D to select
                answers, Arrow keys to navigate.
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="btn ghost"
              style={{
                opacity: index === 0 ? 0.5 : 1,
                cursor: index === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => submit(false)}
                disabled={submitting}
                className="btn ghost"
              >
                💾 Save
              </button>
              <button
                onClick={() =>
                  setIndex(Math.min(exam.questions.length - 1, index + 1))
                }
                disabled={index === exam.questions.length - 1}
                className="btn"
                style={{
                  opacity: index === exam.questions.length - 1 ? 0.5 : 1,
                  cursor:
                    index === exam.questions.length - 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div
          className="exam-right card"
          style={{ margin: "16px", marginLeft: "0", borderRadius: "12px" }}
        >
          {totalTime && (
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: isLowTime ? "#fef2f2" : "#f0fdf4",
                border: `1px solid ${isLowTime ? "#fecaca" : "#dcfce7"}`,
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Time Left
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: isLowTime ? "#ef4444" : "#10b981",
                  fontFamily: "monospace",
                }}
              >
                {formatTime(secondsLeft)}
              </div>
            </div>
          )}

          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#f0f7ff",
              marginBottom: "16px",
              fontSize: "13px",
              borderLeft: "4px solid #0070f3",
            }}
          >
            <div style={{ marginBottom: "4px" }}>
              <strong>{answered}</strong>/{exam.questions.length} Answered
            </div>
            <div style={{ color: "#6b7280" }}>
              {exam.questions.length - answered} Remaining
            </div>
          </div>

          <div
            style={{
              marginBottom: "16px",
              fontSize: "12px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            {msg}
          </div>
        </div>
      </div>
    </>
  );
}

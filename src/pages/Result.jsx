import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Result() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const api = (await import("../api.js")).default;
        const data = await api.apiFetch(`/api/exams/attempts/${id}`);
        setAttempt(data);
      } catch (err) {
        setError(err.message || "Failed to load result");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div className="card">Loading result…</div>
      </div>
    );
  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div className="card" style={{ color: "#dc2626" }}>
          {error}
        </div>
      </div>
    );
  if (!attempt)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div className="card">No result found.</div>
      </div>
    );

  const correct = attempt.correctCount || 0;
  const total = attempt.totalQuestions || (attempt.answers || []).length;
  const incorrect = Math.max(0, total - correct);
  const score =
    typeof attempt.score === "number"
      ? attempt.score
      : Math.round((correct / Math.max(1, total)) * 100);
  const cutMark = 50; // default cut mark
  const passed = score >= cutMark;

  // Helper to get served options
  function servedOptionsFor(qid, question) {
    const orderObj = (attempt.optionOrders || []).find(
      (o) => String(o.question) === String(qid)
    );
    const order = (orderObj && orderObj.optionOrder) || null;
    if (!order) return question.options || [];
    return order.map((origIdx) => question.options[origIdx]);
  }

  // Helper to get displayed correct index
  function displayedCorrectIndex(qid, question) {
    const orderObj = (attempt.optionOrders || []).find(
      (o) => String(o.question) === String(qid)
    );
    const order = (orderObj && orderObj.optionOrder) || null;
    if (!order) return question.correctIndex;
    return order.findIndex((origIdx) => origIdx === question.correctIndex);
  }

  // Donut chart
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Header Card with Score */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "32px",
            alignItems: "center",
          }}
        >
          {/* Score Circle */}
          <div style={{ textAlign: "center" }}>
            <svg width={200} height={200} viewBox="0 0 200 200">
              <g transform="translate(100,100)">
                {/* Background circle */}
                <circle
                  r={radius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth={24}
                />
                {/* Progress circle */}
                <circle
                  r={radius}
                  fill="none"
                  stroke={passed ? "#10b981" : "#ef4444"}
                  strokeWidth={24}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
                {/* Score text */}
                <text
                  x="0"
                  y="8"
                  textAnchor="middle"
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    fill: passed ? "#10b981" : "#ef4444",
                  }}
                >
                  {score}%
                </text>
              </g>
            </svg>
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {passed ? "✓ Passed" : "✗ Failed"}
              </div>
              <div
                style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}
              >
                Cut mark: {cutMark}%
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 style={{ margin: "0 0 16px 0", fontSize: "28px" }}>
              {attempt.exam?.title || "Result"}
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#f0fdf4",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Correct Answers
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#10b981",
                  }}
                >
                  {correct}/{total}
                </div>
              </div>

              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#fef2f2",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  Incorrect Answers
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#ef4444",
                  }}
                >
                  {incorrect}/{total}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              <div>
                <strong>Duration:</strong> {formatTime(attempt.durationSeconds)}
              </div>
              <div>
                <strong>Submitted:</strong>{" "}
                {new Date(attempt.finishedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions & Answers */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
          Question Review ({correct} of {total} correct)
        </h2>

        <div>
          {(attempt.answers || []).map((a, i) => {
            const q = a.question;
            if (!q) return null;

            const served = servedOptionsFor(q._id, q);
            const dispCorrect = displayedCorrectIndex(q._id, q);
            const userSel = a.selectedIndex;
            const isCorrect =
              typeof userSel === "number" && userSel === dispCorrect;
            const isUnanswered = userSel === null;

            return (
              <div
                key={q._id}
                style={{
                  paddingBottom: "20px",
                  marginBottom: "20px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {/* Question Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
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
                      fontWeight: "700",
                      color: "white",
                      backgroundColor: isCorrect
                        ? "#10b981"
                        : isUnanswered
                        ? "#9ca3af"
                        : "#ef4444",
                    }}
                  >
                    {isCorrect ? "✓" : isUnanswered ? "?" : "✗"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600" }}>
                      Question {i + 1}
                      <span
                        style={{
                          color: "#6b7280",
                          fontWeight: "400",
                          marginLeft: "8px",
                        }}
                      >
                        {isCorrect
                          ? "• Correct"
                          : isUnanswered
                          ? "• Unanswered"
                          : "• Incorrect"}
                      </span>
                    </div>
                    <div style={{ marginTop: "4px" }}>{q.text}</div>
                  </div>
                </div>

                {/* Options Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginTop: "12px",
                  }}
                >
                  {served.map((opt, idx) => {
                    const isUserSelected =
                      typeof userSel === "number" && userSel === idx;
                    const isCorrectOption = idx === dispCorrect;
                    const isWrongSelected = isUserSelected && !isCorrectOption;

                    let bgColor = "white";
                    let borderColor = "#e5e7eb";
                    let textColor = "#111827";

                    if (isCorrectOption) {
                      bgColor = "#ecfdf5";
                      borderColor = "#10b981";
                      textColor = "#065f46";
                    } else if (isWrongSelected) {
                      bgColor = "#fef2f2";
                      borderColor = "#ef4444";
                      textColor = "#7f1d1d";
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          border: `2px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          color: textColor,
                        }}
                      >
                        <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                          {opt}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: isCorrectOption
                              ? "#10b981"
                              : isWrongSelected
                              ? "#dc2626"
                              : "#9ca3af",
                          }}
                        >
                          {isCorrectOption && "✓ Correct answer"}
                          {isWrongSelected && "✗ Your answer"}
                          {isUnanswered &&
                            isCorrectOption &&
                            "✓ Correct answer"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
        <Link to="/attempts" className="btn btn-ghost">
          View All Attempts
        </Link>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AttemptDetail() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`http://localhost:4000/api/exams/attempts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => setAttempt(data))
      .catch(() => setMsg("Failed to load attempt"));
  }, [id]);

  if (!attempt)
    return (
      <div style={{ maxWidth: 900, margin: "20px auto" }}>
        {msg || "Loading..."}
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Attempt Result — {attempt.exam?.title}</h2>
      <div>
        Score: {attempt.score}% ({attempt.correctCount}/{attempt.totalQuestions}
        )
      </div>
      <div>Submitted: {new Date(attempt.createdAt).toLocaleString()}</div>
      <ol>
        {attempt.answers.map((a, idx) => {
          const q = a.question || {};
          const selected = a.selectedIndex;
          const correct = q.correctIndex;
          const ok = typeof selected === "number" && selected === correct;
          return (
            <li key={idx} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: "bold" }}>{q.text}</div>
              <div>
                Selected:{" "}
                {selected == null
                  ? "No answer"
                  : String.fromCharCode(65 + selected)}{" "}
                — {selected != null ? q.options && q.options[selected] : ""}
              </div>
              <div>
                Correct: {String.fromCharCode(65 + correct)} —{" "}
                {q.options && q.options[correct]}
              </div>
              <div style={{ color: ok ? "green" : "red" }}>
                {ok ? "Correct" : "Incorrect"}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

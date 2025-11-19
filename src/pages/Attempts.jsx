import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Attempts() {
  const [attempts, setAttempts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/exams/attempts", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => setAttempts(data))
      .catch(() => setMsg("Failed to load attempts"));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>My Attempts</h2>
      {attempts.length === 0 ? (
        <div>{msg || "No attempts yet"}</div>
      ) : (
        <ul>
          {attempts.map((a) => (
            <li key={a._id}>
              <strong>{a.exam?.title || "Exam"}</strong> — {a.score}% —{" "}
              {new Date(a.createdAt).toLocaleString()} —{" "}
              <Link to={`/attempt/${a._id}`}>View</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

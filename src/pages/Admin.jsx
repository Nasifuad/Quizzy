import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, []);
  const [qText, setQText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [qMsg, setQMsg] = useState("");
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQs, setSelectedQs] = useState(new Set());

  const [examTitle, setExamTitle] = useState("");
  const [examDesc, setExamDesc] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [examQIds, setExamQIds] = useState("");
  const [examDuration, setExamDuration] = useState(30);
  const [eMsg, setEMsg] = useState("");

  async function createQuestion(e) {
    e.preventDefault();
    setQMsg("");
    const token = localStorage.getItem("token");
    const payload = {
      text: qText,
      options: opts,
      correctIndex: Number(correctIndex),
    };
    try {
      const res = await fetch("http://localhost:4000/api/exams/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setQMsg(data.message || "Failed");
      setQMsg("Question created: " + data._id);
      setQText("");
      setOpts(["", "", "", ""]);
      setCorrectIndex(0);
      // refresh question list
      fetchQuestions();
    } catch (err) {
      setQMsg("Error creating question");
    }
  }

  async function fetchQuestions() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/exams/questions", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok) setQuestionsList(data);
    } catch (err) {
      // ignore
    }
  }

  async function createExam(e) {
    e.preventDefault();
    setEMsg("");
    const token = localStorage.getItem("token");
    // if user selected questions use them, otherwise fall back to manual IDs
    let questionIds = Array.from(selectedQs);
    if (questionIds.length === 0) {
      questionIds = examQIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const payload = {
      title: examTitle,
      description: examDesc,
      questions: questionIds,
      durationMinutes: Number(examDuration),
      category: examCategory ? String(examCategory).trim() : undefined,
    };
    try {
      const res = await fetch("http://localhost:4000/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setEMsg(data.message || "Failed");
      setEMsg("Exam created: " + data._id);
      setExamTitle("");
      setExamDesc("");
      setExamQIds("");
      setExamCategory("");
    } catch (err) {
      setEMsg("Error creating exam");
    }
  }

  // load questions on mount
  React.useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Admin — Create Question</h2>
      <form onSubmit={createQuestion} style={{ marginBottom: 20 }}>
        <div>
          <label className="text-red-500">Question text</label>
          <textarea
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {opts.map((o, i) => (
            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={o}
              onChange={(e) => {
                const copy = [...opts];
                copy[i] = e.target.value;
                setOpts(copy);
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Correct option</label>
          <select
            value={correctIndex}
            onChange={(e) => setCorrectIndex(e.target.value)}
          >
            <option value={0}>A</option>
            <option value={1}>B</option>
            <option value={2}>C</option>
            <option value={3}>D</option>
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Create Question</button>
        </div>
        <div style={{ marginTop: 8 }}>{qMsg}</div>
      </form>

      <h2>Create Exam</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>Available Questions</strong>
        <div
          style={{
            maxHeight: 200,
            overflow: "auto",
            border: "1px solid #eee",
            padding: 8,
          }}
        >
          {questionsList.map((q) => (
            <label key={q._id} style={{ display: "block", marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={selectedQs.has(q._id)}
                onChange={(e) => {
                  const copy = new Set(selectedQs);
                  if (e.target.checked) copy.add(q._id);
                  else copy.delete(q._id);
                  setSelectedQs(copy);
                }}
              />{" "}
              {q.text} <small style={{ color: "#666" }}>({q._id})</small>
            </label>
          ))}
        </div>
      </div>
      <form onSubmit={createExam}>
        <div>
          <label>Title</label>
          <input
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <input
            value={examDesc}
            onChange={(e) => setExamDesc(e.target.value)}
          />
        </div>
        <div>
          <label>Question IDs (comma separated)</label>
          <input
            value={examQIds}
            onChange={(e) => setExamQIds(e.target.value)}
            placeholder="id1,id2,id3"
          />
        </div>
        <div>
          <label>Category / Section</label>
          <input
            value={examCategory}
            onChange={(e) => setExamCategory(e.target.value)}
            placeholder="e.g. Mathematics"
          />
        </div>
        <div>
          <label>Duration (minutes)</label>
          <input
            value={examDuration}
            onChange={(e) => setExamDuration(e.target.value)}
            type="number"
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Create Exam</button>
        </div>
        <div style={{ marginTop: 8 }}>{eMsg}</div>
      </form>
    </div>
  );
}

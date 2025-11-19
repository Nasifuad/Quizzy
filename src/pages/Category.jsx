import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Category() {
  const { slug } = useParams();
  const title = decodeURIComponent(slug);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `http://localhost:4000/api/exams?category=${encodeURIComponent(title)}`
    )
      .then((r) => r.json())
      .then((data) => {
        // server returns exams for this category; fall back to empty array
        setExams(data || []);
      })
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, [title]);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>{title}</h2>
        <Link to="/dashboard" className="muted">
          Back to all
        </Link>
      </div>

      <p className="muted">Available exams in this section</p>

      {loading ? (
        <div className="muted">Loading exams…</div>
      ) : exams.length === 0 ? (
        <div className="muted">No exams found for this category.</div>
      ) : (
        <ul>
          {exams.map((e) => (
            <li key={e._id} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{e.title}</strong>
                  <div className="muted">{e.description}</div>
                </div>
                <div>
                  <Link to={`/exam/${e._id}`} className="btn primary">
                    Take
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

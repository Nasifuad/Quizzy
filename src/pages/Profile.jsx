import React, { useEffect, useState } from "react";
import { fetchCurrentUser, apiFetch } from "../api";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const u = await fetchCurrentUser();
      if (!mounted) return;
      setUser(u);
      try {
        const at = await apiFetch("/api/exams/attempts");
        if (mounted) setAttempts(at || []);
      } catch (e) {
        if (mounted) setAttempts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="card">Loading profile…</div>;
  if (!user) return <div className="card">Not signed in.</div>;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Profile</h2>
      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>Name:</strong> {user.name || "-"}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Role:</strong> {user.role}
        </div>
      </div>

      <h3>Attempts</h3>
      {attempts.length === 0 ? (
        <div className="muted">No attempts yet.</div>
      ) : (
        <ul>
          {attempts.map((a) => (
            <li key={a._id} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{a.exam?.title || "Exam"}</strong>
                  <div className="muted">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>
                    Score: <strong>{a.score}%</strong>
                  </div>
                  <div>
                    <Link to={`/attempt/${a._id}`}>View</Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

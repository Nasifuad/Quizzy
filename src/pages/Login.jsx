import React, { useState, useEffect } from "react";
import { fetchCurrentUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const data = await (
        await import("../api.js")
      ).default.login(email, password);
      setMsg("Logged in");
      window.location.href = "/dashboard";
    } catch (err) {
      setMsg(err.message || "Error connecting to server");
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchCurrentUser();
      if (u && mounted) {
        // already logged in -> redirect
        window.location.href = "/dashboard";
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div className="auth-card card">
      <h2 style={{ marginTop: 0 }}>Welcome back</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Sign in to continue to the exam dashboard
      </p>

      <form onSubmit={submit}>
        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button className="btn primary" type="submit">
            Login
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setEmail("demo@demo.com");
              setPassword("password");
            }}
          >
            Demo
          </button>
        </div>
      </form>

      <div className="form-msg" style={{ marginTop: 12 }}>
        {msg}
      </div>
    </div>
  );
}

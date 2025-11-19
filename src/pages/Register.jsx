import React, { useState, useEffect } from "react";
import { fetchCurrentUser } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const api = (await import("../api.js")).default;
      await api.register(name, email, password);
      setMsg("Registered — you can now login");
      window.location.href = "/login";
    } catch (err) {
      setMsg("Error connecting to server");
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchCurrentUser();
      if (u && mounted) window.location.href = "/dashboard";
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div className="auth-card card">
      <h2 style={{ marginTop: 0 }}>Create account</h2>
      <p className="muted">Sign up to start practicing MCQs</p>

      <form onSubmit={submit}>
        <div className="form-row">
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            Register
          </button>
        </div>
      </form>

      <div className="form-msg" style={{ marginTop: 12 }}>
        {msg}
      </div>
    </div>
  );
}

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCurrentUser, logout } from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchCurrentUser();
      if (mounted) setUser(u);
    })();
    return () => (mounted = false);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
    window.location.reload();
  }

  return (
    <header className="site-header">
      <div className="brand">
        <strong>BCS Exam</strong>
      </div>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        {user && user.role === "admin" ? <Link to="/admin">Admin</Link> : null}
        {user ? (
          <>
            <Link to="/profile" className="muted" style={{ marginLeft: 12 }}>
              {user.name || user.email}
            </Link>
            <button
              onClick={handleLogout}
              className="btn ghost"
              style={{ marginLeft: 12 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="content">
        <div className="card">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">© BCS Exam — built with care</footer>
    </div>
  );
}

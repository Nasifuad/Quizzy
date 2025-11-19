import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TakeExam from "./pages/TakeExam";
import Admin from "./pages/Admin";
import Attempts from "./pages/Attempts";
import AttemptDetail from "./pages/AttemptDetail";
import Result from "./pages/Result";
import Category from "./pages/Category";
import Profile from "./pages/Profile";
import "./styles.css";
import "./tailwind.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="profile" element={<Profile />} />
          <Route path="exam/:id" element={<TakeExam />} />
          <Route path="admin" element={<Admin />} />
          <Route path="attempts" element={<Attempts />} />
          <Route path="attempt/:id" element={<AttemptDetail />} />
          <Route path="result/:id" element={<Result />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

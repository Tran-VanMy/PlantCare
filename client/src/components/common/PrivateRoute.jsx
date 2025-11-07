import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" replace />;

  if (role && user.role_id) {
    const requiredRoleId =
      role === "admin" ? 1 : role === "staff" ? 2 : role === "customer" ? 3 : null;
    if (requiredRoleId && user.role_id !== requiredRoleId)
      return <Navigate to="/" replace />;
  }

  return children;
}

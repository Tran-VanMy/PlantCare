// frontend/src/hooks/useAuth.js
import { useMemo } from "react";

export default function useAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const isAuthenticated = !!token;
  const role =
    user?.role_id === 1
      ? "admin"
      : user?.role_id === 2
      ? "staff"
      : user?.role_id === 3
      ? "customer"
      : null;

  return useMemo(
    () => ({ token, user, role, isAuthenticated }),
    [token, user, role, isAuthenticated]
  );
}

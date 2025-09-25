import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return {
    user,
    token,
    isAdmin: user?.role === "Admin",
    isManager: user?.role === "Manager",
    isStaff: user?.role === "WarehouseStaff",
    logout,
  };
}

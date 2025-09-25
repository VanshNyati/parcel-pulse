import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function TopNav() {
  const loc = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const link = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1 rounded ${
        loc.pathname === to || loc.pathname.startsWith(to + "/")
          ? "bg-brand-100 text-brand-800"
          : "text-gray-600 hover:text-brand-700"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white/90 backdrop-blur shadow px-4 py-3 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/campus-express-logo.jpg"
            alt="Campus Express"
            className="h-8"
          />
          <span className="text-brand-700 font-semibold">Campus Express</span>
          <div className="hidden md:flex items-center gap-1 ml-4">
            {link("/", "Dashboard")}
            {link("/shipments", "Shipments")}
            {link("/inventory", "Inventory")}
            {link("/warehouses", "Warehouses")}
            {isAdmin && link("/users", "Users")}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            // show role once; avoid "Admin • Admin"
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
          )}
          <button
            onClick={logout}
            className="text-sm bg-brand-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

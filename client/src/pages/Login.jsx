import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const DEMO =
  import.meta.env.MODE !== "production" &&
  import.meta.env.VITE_DEMO_LOGIN === "1";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch {
      setErr("Invalid credentials");
      toast.error("Login failed");
    }
  };

  const fillDemo = () => {
    setEmail("admin@cx.com");
    setPassword("Admin@123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-sm"
      >
        <img
          src="/campus-express-logo.jpg"
          alt="Campus Express"
          className="h-10 mb-4"
        />
        <h1 className="text-xl font-semibold text-brand-700 mb-3">Sign in</h1>

        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

        <input
          className="border rounded w-full p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          autoComplete="username"
        />
        <input
          className="border rounded w-full p-2 mb-4"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />

        <button className="w-full py-2 rounded bg-brand-600 text-white hover:bg-brand-700">
          Login
        </button>

        {DEMO && (
          <button
            type="button"
            onClick={fillDemo}
            className="w-full mt-2 py-2 rounded border text-sm"
            title="Fill demo credentials (dev only)"
          >
            Fill demo credentials
          </button>
        )}
      </form>
    </div>
  );
}

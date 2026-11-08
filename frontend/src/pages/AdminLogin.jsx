import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken, getToken } from "../services/api.js";
import { useEffect } from "react";

export default function AdminLogin() {
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (getToken()) nav("/admin/dashboard", { replace: true }); }, [nav]);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { const r = await api.login(u, p); setToken(r.access_token); nav("/admin/dashboard"); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="admin" style={{ display: "grid", placeItems: "center", padding: "1.5rem" }}>
      <form className="panel form" onSubmit={submit} style={{ width: "min(420px, 100%)" }}>
        <h1 className="serif" style={{ fontSize: "2.2rem" }}>Staff login</h1>
        {error && <p className="notice-error" role="alert">{error}</p>}
        <div className="field"><label htmlFor="u">Username</label><input id="u" required autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} /></div>
        <div className="field"><label htmlFor="p">Password</label><input id="p" type="password" required autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} /></div>
        <button className="btn btn-gold" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "../services/api.js";
import { money, STOCK } from "../components/ui.jsx";
import Img from "../components/Img.jsx";

const TABS = ["Overview", "Appointments", "Enquiries", "Products", "Services", "Gallery"];
const num = (v) => (v === "" || v == null ? null : Number(v));

function useList(loader) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    return loader().then((d) => { setData(d); setError(""); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [loader]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}

const Msg = ({ error, loading }) => (error ? <p className="notice-error" role="alert">{error}</p> : loading ? <p className="state">Loading…</p> : null);

function Overview() {
  const loader = useCallback(() => api.admin.dashboard().then((d) => [d]), []);
  const { data, error, loading } = useList(loader);
  const s = data[0];
  const labels = [["pending_appointments", "Pending appointments"], ["approved_appointments", "Approved"], ["total_appointments", "Total requests"], ["unhandled_enquiries", "New enquiries"], ["products", "Products"], ["out_of_stock", "Out of stock"], ["services", "Services"]];
  return <><Msg error={error} loading={loading} />{s && <div className="stats">{labels.map(([k, l]) => <div className="stat" key={k}><b>{s[k]}</b>{l}</div>)}</div>}</>;
}

function Appointments() {
  const { data, error, loading, reload } = useList(api.admin.appointments);
  const [err, setErr] = useState("");
  const act = async (id, status) => { try { await api.admin.setAppointmentStatus(id, status); setErr(""); reload(); } catch (e) { setErr(e.message); } };
  return (
    <>
      <Msg error={error || err} loading={loading} />
      {!loading && data.length === 0 && <p className="state">No appointment requests yet.</p>}
      {data.length > 0 && (
        <div className="table-wrap"><table>
          <thead><tr><th>Client</th><th>Service</th><th>Date & time</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{data.map((a) => (
            <tr key={a.id}>
              <td>{a.customer_name}<br /><a href={`tel:${a.phone}`}>{a.phone}</a></td>
              <td>{a.service_name}</td><td>{a.preferred_date}<br />{a.preferred_time}</td><td>{a.notes || "-"}</td>
              <td><span className={`pill ${a.status}`}>{a.status}</span></td>
              <td><div className="row-actions">
                {a.status !== "approved" && <button className="btn btn-sm" onClick={() => act(a.id, "approved")}>Approve</button>}
                {a.status !== "rejected" && <button className="btn btn-sm btn-danger" onClick={() => act(a.id, "rejected")}>Reject</button>}
                {a.status !== "pending" && <button className="btn btn-sm" onClick={() => act(a.id, "pending")}>Reset</button>}
              </div></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}

function Enquiries() {
  const { data, error, loading, reload } = useList(api.admin.enquiries);
  const [err, setErr] = useState("");
  const toggle = async (e) => { try { await api.admin.setEnquiryHandled(e.id, !e.handled); setErr(""); reload(); } catch (x) { setErr(x.message); } };
  return (
    <>
      <Msg error={error || err} loading={loading} />
      {!loading && data.length === 0 && <p className="state">No enquiries yet.</p>}
      {data.length > 0 && (
        <div className="table-wrap"><table>
          <thead><tr><th>From</th><th>About</th><th>Message</th><th>Received</th><th></th></tr></thead>
          <tbody>{data.map((e) => (
            <tr key={e.id}>
              <td>{e.name}<br /><a href={`tel:${e.phone}`}>{e.phone}</a>{e.email && <><br />{e.email}</>}</td>
              <td>{e.product_name || "General"}</td><td>{e.message}</td><td>{e.created_at}</td>
              <td><button className="btn btn-sm" onClick={() => toggle(e)}>{e.handled ? "Mark as new" : "Mark handled"}</button></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}

function ImagePicker({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function pick(e) {
    const file = e.target.files[0]; if (!file) return;
    setBusy(true); setErr("");
    try { const r = await api.admin.upload(file); onChange(r.url); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return (
    <div className="field">
      <label>Photo</label>
      {value && <div style={{ width: 90, marginBottom: ".5rem" }}><Img src={value} alt="Selected" /></div>}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} />
      {busy && <small>Uploading…</small>}{err && <small className="notice-error">{err}</small>}
    </div>
  );
}

function Products() {
  const { data, error, loading, reload } = useList(api.products);
  const blank = { name: "", category: "Bundles", texture: "", length_inches: "", description: "", price: "", stock_status: "enquire", image_url: "" };
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const payload = () => ({ ...f, texture: f.texture || null, length_inches: num(f.length_inches), price: num(f.price), image_url: f.image_url || null });

  async function save(e) {
    e.preventDefault(); setErr("");
    try { editing ? await api.admin.updateProduct(editing, payload()) : await api.admin.createProduct(payload()); setF(blank); setEditing(null); reload(); }
    catch (x) { setErr(x.message); }
  }
  const edit = (p) => { setEditing(p.id); setF({ ...blank, ...p, texture: p.texture || "", length_inches: p.length_inches ?? "", price: p.price ?? "", image_url: p.image_url || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const quick = async (p, patch) => { try { await api.admin.updateProduct(p.id, patch); reload(); } catch (x) { setErr(x.message); } };
  const del = async (p) => { if (!window.confirm(`Delete "${p.name}"?`)) return; try { await api.admin.deleteProduct(p.id); reload(); } catch (x) { setErr(x.message); } };

  return (
    <>
      <form className="panel form" onSubmit={save} style={{ maxWidth: "none" }}>
        <h3>{editing ? "Edit product" : "Add product"}</h3>
        {err && <p className="notice-error" role="alert">{err}</p>}
        <div className="two">
          <div className="field"><label>Name</label><input required minLength={2} value={f.name} onChange={set("name")} /></div>
          <div className="field"><label>Category</label><input required minLength={2} value={f.category} onChange={set("category")} /></div>
          <div className="field"><label>Texture</label><input value={f.texture} onChange={set("texture")} /></div>
          <div className="field"><label>Length (inches)</label><input type="number" min="4" max="60" value={f.length_inches} onChange={set("length_inches")} /></div>
          <div className="field"><label>Price (Rand, blank = price on request)</label><input type="number" min="0" step="0.01" value={f.price} onChange={set("price")} /></div>
          <div className="field"><label>Stock</label><select value={f.stock_status} onChange={set("stock_status")}>{Object.entries(STOCK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        </div>
        <div className="field"><label>Description</label><textarea value={f.description} onChange={set("description")} /></div>
        <ImagePicker value={f.image_url} onChange={(url) => setF({ ...f, image_url: url })} />
        <div className="btn-row" style={{ margin: 0 }}>
          <button className="btn btn-gold">{editing ? "Save changes" : "Add product"}</button>
          {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}
        </div>
      </form>
      <Msg error={error} loading={loading} />
      <div className="table-wrap"><table>
        <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>{data.map((p) => (
          <tr key={p.id}>
            <td>{p.name}{p.is_demo && <span className="pill"> demo</span>}<br /><span className="muted">{[p.category, p.texture].filter(Boolean).join(" · ")}</span></td>
            <td>{money(p.price)}</td>
            <td><select value={p.stock_status} onChange={(e) => quick(p, { stock_status: e.target.value })}>{Object.entries(STOCK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
            <td><div className="row-actions"><button className="btn btn-sm" onClick={() => edit(p)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => del(p)}>Delete</button></div></td>
          </tr>))}</tbody>
      </table></div>
    </>
  );
}

function Services() {
  const { data, error, loading, reload } = useList(api.services);
  const blank = { name: "", description: "", price: "", duration_minutes: "", image_url: "", bookable: true };
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const payload = () => ({ ...f, price: num(f.price), duration_minutes: num(f.duration_minutes), image_url: f.image_url || null });

  async function save(e) {
    e.preventDefault(); setErr("");
    try { editing ? await api.admin.updateService(editing, payload()) : await api.admin.createService(payload()); setF(blank); setEditing(null); reload(); }
    catch (x) { setErr(x.message); }
  }
  const edit = (s) => { setEditing(s.id); setF({ ...blank, ...s, price: s.price ?? "", duration_minutes: s.duration_minutes ?? "", image_url: s.image_url || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggle = async (s) => { try { await api.admin.updateService(s.id, { bookable: !s.bookable }); reload(); } catch (x) { setErr(x.message); } };
  const del = async (s) => { if (!window.confirm(`Delete "${s.name}"?`)) return; try { await api.admin.deleteService(s.id); reload(); } catch (x) { setErr(x.message); } };

  return (
    <>
      <form className="panel form" onSubmit={save} style={{ maxWidth: "none" }}>
        <h3>{editing ? "Edit service" : "Add service"}</h3>
        {err && <p className="notice-error" role="alert">{err}</p>}
        <div className="two">
          <div className="field"><label>Name</label><input required minLength={2} value={f.name} onChange={set("name")} /></div>
          <div className="field"><label>Price (Rand, blank = price on request)</label><input type="number" min="0" step="0.01" value={f.price} onChange={set("price")} /></div>
          <div className="field"><label>Duration (minutes)</label><input type="number" min="5" max="1440" value={f.duration_minutes} onChange={set("duration_minutes")} /></div>
          <div className="field"><label>Booking</label><select value={String(f.bookable)} onChange={(e) => setF({ ...f, bookable: e.target.value === "true" })}><option value="true">Available to book</option><option value="false">Not bookable</option></select></div>
        </div>
        <div className="field"><label>Description</label><textarea value={f.description} onChange={set("description")} /></div>
        <ImagePicker value={f.image_url} onChange={(url) => setF({ ...f, image_url: url })} />
        <div className="btn-row" style={{ margin: 0 }}>
          <button className="btn btn-gold">{editing ? "Save changes" : "Add service"}</button>
          {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}
        </div>
      </form>
      <Msg error={error} loading={loading} />
      <div className="table-wrap"><table>
        <thead><tr><th>Service</th><th>Price</th><th>Duration</th><th>Booking</th><th>Actions</th></tr></thead>
        <tbody>{data.map((s) => (
          <tr key={s.id}>
            <td>{s.name}{s.is_demo && <span className="pill"> demo</span>}</td><td>{money(s.price)}</td><td>{s.duration_minutes ? `${s.duration_minutes} min` : "-"}</td>
            <td><button className="btn btn-sm" onClick={() => toggle(s)}>{s.bookable ? "Bookable" : "Not bookable"}</button></td>
            <td><div className="row-actions"><button className="btn btn-sm" onClick={() => edit(s)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => del(s)}>Delete</button></div></td>
          </tr>))}</tbody>
      </table></div>
    </>
  );
}

function Gallery() {
  const { data, error, loading, reload } = useList(api.gallery);
  const [f, setF] = useState({ title: "", category: "", image_url: "" });
  const [err, setErr] = useState("");
  async function add(e) {
    e.preventDefault(); setErr("");
    if (!f.image_url) { setErr("Please upload a photo first."); return; }
    try { await api.admin.addGallery(f); setF({ title: "", category: "", image_url: "" }); reload(); } catch (x) { setErr(x.message); }
  }
  const del = async (g) => { if (!window.confirm(`Remove "${g.title}"?`)) return; try { await api.admin.deleteGallery(g.id); reload(); } catch (x) { setErr(x.message); } };
  return (
    <>
      <form className="panel form" onSubmit={add} style={{ maxWidth: "none" }}>
        <h3>Add gallery image</h3>
        {err && <p className="notice-error" role="alert">{err}</p>}
        <div className="two">
          <div className="field"><label>Title</label><input required minLength={2} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="field"><label>Category (e.g. Bobs)</label><input required minLength={2} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
        </div>
        <ImagePicker value={f.image_url} onChange={(url) => setF({ ...f, image_url: url })} />
        <button className="btn btn-gold">Add to gallery</button>
      </form>
      <Msg error={error} loading={loading} />
      <div className="grid grid-4">{data.map((g) => (
        <div className="card" key={g.id}><div className="media square"><Img src={g.image_url} alt={g.title} /></div>
          <div className="body"><strong>{g.title}</strong><span className="meta">{g.category}{g.is_demo ? " · demo" : ""}</span>
            <div className="actions"><button className="btn btn-sm btn-danger" onClick={() => del(g)}>Remove</button></div></div></div>))}</div>
    </>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("Overview");
  const logout = useCallback(() => { setToken(null); nav("/admin", { replace: true }); }, [nav]);
  useEffect(() => {
    if (!getToken()) { nav("/admin", { replace: true }); return; }
    window.addEventListener("hbn-logout", logout);
    return () => window.removeEventListener("hbn-logout", logout);
  }, [nav, logout]);
  if (!getToken()) return null;

  const View = { Overview, Appointments, Enquiries, Products, Services, Gallery }[tab];
  return (
    <div className="admin">
      <div className="admin-bar">
        <strong className="serif" style={{ fontSize: "1.5rem", color: "var(--gold)" }}>Hair By Neo · Dashboard</strong>
        <span><Link to="/" className="btn btn-sm">View site</Link> <button className="btn btn-sm" onClick={logout}>Log out</button></span>
      </div>
      <div className="admin-main">
        <div className="tabs" role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={t === tab} className={`chip ${t === tab ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}</div>
        <View />
      </div>
    </div>
  );
}

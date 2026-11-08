import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import Img from "../components/Img.jsx";
import { PageHero, Status, WhatsAppButton, money, STOCK, DemoTag } from "../components/ui.jsx";

function EnquiryForm({ product, onClose }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", message: `I'd like to enquire about: ${product.name}` });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { await api.sendEnquiry({ ...f, email: f.email || null, product_id: product.id }); setDone(true); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="panel" role="dialog" aria-label={`Enquire about ${product.name}`}>
      <h3>Enquire: {product.name}</h3>
      {done ? (
        <><p className="notice notice-ok">Thank you. Your enquiry has been received and Neo will be in touch.</p><button className="btn btn-sm" onClick={onClose}>Close</button></>
      ) : (
        <form className="form" onSubmit={submit}>
          {error && <p className="notice-error" role="alert">{error}</p>}
          <div className="two">
            <div className="field"><label htmlFor="en-name">Name</label><input id="en-name" required value={f.name} onChange={set("name")} /></div>
            <div className="field"><label htmlFor="en-phone">Phone</label><input id="en-phone" required inputMode="tel" value={f.phone} onChange={set("phone")} /></div>
          </div>
          <div className="field"><label htmlFor="en-email">Email (optional)</label><input id="en-email" type="email" value={f.email} onChange={set("email")} /></div>
          <div className="field"><label htmlFor="en-msg">Message</label><textarea id="en-msg" required value={f.message} onChange={set("message")} /></div>
          <div className="btn-row" style={{ margin: 0 }}>
            <button className="btn btn-gold" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [texture, setTexture] = useState("");
  const [inStock, setInStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enquiring, setEnquiring] = useState(null);

  useEffect(() => { api.products().then(setAll).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.products({ q, category, texture, in_stock_only: inStock })
        .then((d) => { setProducts(d); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, texture, inStock]);

  const categories = [...new Set(all.map((p) => p.category))];
  const textures = [...new Set(all.map((p) => p.texture).filter(Boolean))];

  return (
    <>
      <PageHero eyebrow="Shop" title="The hair collection">Browse our hair. Prices and availability are confirmed when you enquire.</PageHero>
      <section className="section">
        <div className="container">
          <div className="form" style={{ maxWidth: "none", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", alignItems: "end", marginBottom: "2rem" }}>
            <div className="field"><label htmlFor="q">Search</label><input id="q" type="search" placeholder="e.g. body wave" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="field"><label htmlFor="cat">Category</label><select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label htmlFor="tex">Texture</label><select id="tex" value={texture} onChange={(e) => setTexture(e.target.value)}><option value="">All</option>{textures.map((c) => <option key={c}>{c}</option>)}</select></div>
            <label className="chip" style={{ display: "flex", gap: ".5rem", alignItems: "center" }}><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
          </div>

          {enquiring && <EnquiryForm product={enquiring} onClose={() => setEnquiring(null)} />}
          <Status loading={loading} error={error} empty={!loading && !error && products.length === 0} emptyText="No products match your search." />
          <div className="grid grid-4">
            {products.map((p) => (
              <article className="card" key={p.id}>
                <div className="media square"><Img src={p.image_url} alt={p.name} /><DemoTag show={p.is_demo} /></div>
                <div className="body">
                  <span className="meta">{[p.category, p.texture, p.length_inches && `${p.length_inches}"`].filter(Boolean).join(" · ")}</span>
                  <h3>{p.name}</h3>
                  <p className="muted">{p.description}</p>
                  <span className="price">{money(p.price)}</span>
                  <span className={`badge ${p.stock_status}`}>{STOCK[p.stock_status]}</span>
                  <div className="actions">
                    <button className="btn btn-sm btn-gold" onClick={() => { setEnquiring(p); window.scrollTo({ top: 200, behavior: "smooth" }); }}>Enquire</button>
                    <WhatsAppButton text="WhatsApp" className="btn btn-sm" message={`Hello, I'd like to enquire about: ${p.name}`} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

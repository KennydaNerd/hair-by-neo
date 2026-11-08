import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api.js";
import { DEMO_IMAGES } from "../assets.js";
import Img from "../components/Img.jsx";
import { PageHero, Status, DemoTag } from "../components/ui.jsx";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);

  useEffect(() => { api.gallery().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  const cats = ["All", ...new Set(items.map((i) => i.category))];
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);

  const step = useCallback((d) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)), [shown.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, step]);

  const current = open !== null ? shown[open] : null;
  return (
    <>
      <PageHero eyebrow="Gallery" title="Hair gallery">Straight, body wave, curly, bobs and long flowing styles.</PageHero>
      <section className="section">
        <div className="container">
          {DEMO_IMAGES && <p className="demo-note" style={{ marginBottom: "1.5rem" }}>These are AI-generated demonstration images, not Neo's clients or installations. Real work will replace them.</p>}
          <div className="chips" role="group" aria-label="Filter by style">
            {cats.map((c) => <button key={c} className={`chip ${c === cat ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <Status loading={loading} error={error} empty={!loading && !error && shown.length === 0} emptyText="Gallery images coming soon." />
          <div className="masonry">
            {shown.map((g, i) => (
              <button key={g.id} onClick={() => setOpen(i)} aria-label={`View ${g.title}`}>
                <Img src={g.image_url} alt={g.title} /><DemoTag show={g.is_demo} />
              </button>
            ))}
          </div>
        </div>
      </section>
      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.title} onClick={() => setOpen(null)}>
          <button className="lb-btn lb-close" aria-label="Close" onClick={() => setOpen(null)}>×</button>
          <button className="lb-btn lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
          <button className="lb-btn lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
          <figure onClick={(e) => e.stopPropagation()}>
            <Img src={current.image_url} alt={current.title} eager />
            <figcaption>{current.title}{current.is_demo ? " (demonstration image)" : ""}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

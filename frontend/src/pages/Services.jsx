import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { IMG } from "../assets.js";
import Img from "../components/Img.jsx";
import { PageHero, Status, money, DemoTag } from "../components/ui.jsx";

export default function Services() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { api.services().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return (
    <>
      <PageHero eyebrow="Services" title="Services">Browse what's on offer and request your appointment.</PageHero>
      <section className="section">
        <div className="container">
          <Status loading={loading} error={error} empty={!loading && !error && items.length === 0} emptyText="Services will be listed here soon." />
          <div className="grid grid-3">
            {items.map((s, i) => (
              <article className="card" key={s.id}>
                <div className="media"><Img src={s.image_url || IMG.services[i % 3]} alt={s.name} /><DemoTag show={s.is_demo} /></div>
                <div className="body">
                  <h3>{s.name}</h3>
                  <p className="muted">{s.description}</p>
                  <p className="meta">{money(s.price)}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}</p>
                  <div className="actions">
                    {s.bookable ? <Link className="btn btn-sm" to={`/booking?service=${s.id}`}>Book this service</Link> : <span className="badge">Not currently bookable</span>}
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

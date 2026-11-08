import { BUSINESS } from "../config.js";
import { PageHero, WhatsAppButton } from "../components/ui.jsx";

const TBS = <span className="muted">To be supplied</span>;

export default function Contact() {
  const b = BUSINESS;
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch">Questions about hair, services or availability? Send a message.</PageHero>
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <div>
            <div className="panel">
              <h3>WhatsApp</h3>
              <p className="muted">The fastest way to reach us.</p>
              <WhatsAppButton className="btn btn-gold" />
            </div>
            <div className="panel">
              <h3>Details</h3>
              <p><strong>Location:</strong> {b.area}</p>
              <p><strong>Address:</strong> {b.streetAddress || TBS}</p>
              <p><strong>Phone:</strong> {b.phone || TBS}</p>
              <p><strong>Email:</strong> {b.email || TBS}</p>
              <h3 style={{ marginTop: "1.2rem" }}>Opening hours</h3>
              {b.hours.length ? <ul className="hours">{b.hours.map(([d, t]) => <li key={d}><span>{d}</span><span>{t}</span></li>)}</ul> : <p>{TBS}</p>}
              <h3 style={{ marginTop: "1.2rem" }}>Social media</h3>
              {b.socials.length ? b.socials.map((s) => <p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></p>) : <p>{TBS}</p>}
            </div>
          </div>
          <div>
            {b.mapEmbedUrl
              ? <iframe className="map" title="Map to Hair By Neo Malapane" src={b.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              : <div className="state">Map will appear here once the business address is verified.</div>}
          </div>
        </div>
      </section>
    </>
  );
}

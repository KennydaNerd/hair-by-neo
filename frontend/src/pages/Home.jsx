import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { IMG, DEMO_IMAGES } from "../assets.js";
import { TESTIMONIALS } from "../config.js";
import Img from "../components/Img.jsx";
import { SectionHead, WhatsAppButton, money, DemoTag } from "../components/ui.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  useEffect(() => {
    api.products().then((d) => setProducts(d.slice(0, 4))).catch(() => {});
    api.services().then((d) => setServices(d.slice(0, 3))).catch(() => {});
    api.gallery().then((d) => setGallery(d.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <picture>
          <source media="(max-width: 700px)" srcSet={IMG.heroMobile} />
          <Img className="hero-img" src={IMG.hero} alt="" eager />
        </picture>
        <div className="container">
          <div className="hero-copy">
            <p className="eyebrow">Hair By Neo Malapane · Katlehong</p>
            <h1>Your hair. <em>Your crown.</em> Your statement.</h1>
            <p className="lead">Discover the art of beautiful hair with Hair By Neo Malapane.</p>
            <div className="btn-row">
              <Link to="/shop" className="btn btn-gold">Shop Hair</Link>
              <Link to="/booking" className="btn">Book Appointment</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">The Brand</p>
            <h2 className="serif">Elegance, confidence, and hair that commands attention.</h2>
            <p className="muted">Hair By Neo Malapane brings premium hair and professional styling to Katlehong. From quality hair collections to flawless installations, every detail is about helping you feel like the best version of yourself.</p>
            <Link to="/about" className="btn">Our Story</Link>
          </div>
          <Img className="feature-img" src={IMG.aboutSalon} alt="Luxury salon (demonstration image)" />
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Services" title="Crafted for you">Choose a service and send a booking request. Every request is confirmed personally.</SectionHead>
          <div className="grid grid-3">
            {services.map((s, i) => (
              <article className="card" key={s.id}>
                <div className="media"><Img src={s.image_url || IMG.services[i % 3]} alt={s.name} /><DemoTag show={s.is_demo} /></div>
                <div className="body"><h3>{s.name}</h3><p className="muted">{s.description}</p></div>
              </article>
            ))}
          </div>
          <div className="btn-row" style={{ justifyContent: "center" }}><Link to="/services" className="btn">All Services</Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="The Collection" title="Featured hair collections">Quality bundles, frontals and extensions. Prices and availability are confirmed on enquiry.</SectionHead>
          <div className="grid grid-4">
            {products.map((p) => (
              <article className="card" key={p.id}>
                <div className="media square"><Img src={p.image_url} alt={p.name} /><DemoTag show={p.is_demo} /></div>
                <div className="body"><span className="meta">{p.texture || p.category}</span><h3>{p.name}</h3><span className="price">{money(p.price)}</span></div>
              </article>
            ))}
          </div>
          <div className="btn-row" style={{ justifyContent: "center" }}><Link to="/shop" className="btn btn-gold">Shop Hair</Link></div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="section alt">
          <div className="container">
            <SectionHead eyebrow="Gallery" title="Installation gallery" />
            <div className="grid grid-3">
              {gallery.slice(0, 3).map((g) => (
                <div className="card" key={g.id}><div className="media" style={{ aspectRatio: "4/5" }}><Img src={g.image_url} alt={g.title} /><DemoTag show={g.is_demo} /></div></div>
              ))}
            </div>
            <div className="btn-row" style={{ justifyContent: "center" }}><Link to="/gallery" className="btn">View Gallery</Link></div>
            {DEMO_IMAGES && <p className="demo-note" style={{ marginTop: "1.5rem" }}>Demonstration artwork shown until Neo's own photography is added.</p>}
          </div>
        </section>
      )}

      {TESTIMONIALS.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Client Love" title="What clients say" />
            <div className="grid grid-3">{TESTIMONIALS.map((t, i) => <blockquote className="panel" key={i}><p>“{t.text}”</p><footer className="muted">{t.name}</footer></blockquote>)}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="banner">
            <Img src={IMG.bookingBanner} alt="" />
            <div className="banner-copy">
              <p className="eyebrow">Book Appointment</p>
              <h2 className="serif">Ready for your new look?</h2>
              <p className="lead">Send a request and Neo will confirm your appointment.</p>
              <div className="btn-row"><Link to="/booking" className="btn btn-gold">Book Appointment</Link><WhatsAppButton /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

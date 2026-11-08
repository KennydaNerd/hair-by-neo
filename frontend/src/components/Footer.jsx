import { Link } from "react-router-dom";
import { BUSINESS } from "../config.js";
import { DEMO_IMAGES } from "../assets.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="serif footer-brand">Hair By Neo Malapane</p>
          <p className="muted">{BUSINESS.area}</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/shop">Shop Hair</Link>
          <Link to="/services">Services</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/booking">Book Appointment</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div>
          {BUSINESS.socials.length === 0 && <p className="muted">Social links to be added.</p>}
          {BUSINESS.socials.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} Hair By Neo Malapane</span>
        {DEMO_IMAGES && <span>Images shown are AI-generated demonstration artwork, not client work.</span>}
        <Link to="/admin">Staff login</Link>
      </div>
    </footer>
  );
}

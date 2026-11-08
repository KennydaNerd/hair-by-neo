import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";

const LINKS = [["/", "Home"], ["/about", "About"], ["/services", "Services"], ["/shop", "Shop"], ["/gallery", "Gallery"], ["/contact", "Contact"]];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" aria-label="Hair By Neo Malapane home"><Logo height={48} /></Link>
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen(!open)}>
          <span className="sr-only">Menu</span>
          <span className={`burger ${open ? "open" : ""}`} aria-hidden="true" />
        </button>
        <nav id="nav-menu" className={`nav-menu ${open ? "open" : ""}`} aria-label="Main">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
          ))}
          <Link to="/booking" className="btn btn-gold btn-sm">Book Appointment</Link>
        </nav>
      </div>
    </header>
  );
}

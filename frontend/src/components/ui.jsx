import { Link } from "react-router-dom";
import { BUSINESS } from "../config.js";

export const money = (p) => (p == null ? "Price on request" : `R${Number(p).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
export const STOCK = { in_stock: "In stock", low_stock: "Low stock", out_of_stock: "Out of stock", enquire: "Availability on enquiry" };

export function SectionHead({ eyebrow, title, children }) {
  return (
    <div className="section-head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="serif">{title}</h2>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="serif">{title}</h1>
        {children && <p className="lead">{children}</p>}
      </div>
    </section>
  );
}

export function Status({ loading, error, empty, emptyText = "Nothing to show yet." }) {
  if (loading) return <p className="state" role="status">Loading…</p>;
  if (error) return <p className="state state-error" role="alert">{error}</p>;
  if (empty) return <p className="state">{emptyText}</p>;
  return null;
}

export function WhatsAppButton({ text = "Chat on WhatsApp", message = "Hello, I would like to enquire.", className = "btn btn-outline" }) {
  if (!BUSINESS.whatsapp) return <span className={`${className} disabled`} aria-disabled="true">WhatsApp number coming soon</span>;
  return <a className={className} target="_blank" rel="noreferrer" href={`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`}>{text}</a>;
}

export const DemoTag = ({ show }) => (show ? <span className="demo-tag">Demo</span> : null);
export { Link };

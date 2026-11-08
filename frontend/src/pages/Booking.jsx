import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { PageHero, Status } from "../components/ui.jsx";

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const EMPTY = { service_id: "", customer_name: "", phone: "", preferred_date: "", preferred_time: "", notes: "" };

export default function Booking() {
  const [params] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [f, setF] = useState({ ...EMPTY, service_id: params.get("service") || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    api.services().then((d) => setServices(d.filter((s) => s.bookable))).catch((e) => setLoadError(e.message)).finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const r = await api.requestAppointment({ ...f, service_id: Number(f.service_id) });
      setReceipt(r); setF(EMPTY);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHero eyebrow="Book" title="Request an appointment">Choose a service and your preferred date and time. Your request stays pending until Neo approves it.</PageHero>
      <section className="section">
        <div className="container">
          <Status loading={loading} error={loadError} />
          {receipt && (
            <div className="notice notice-ok" role="status">
              <strong>Request received (reference #{receipt.id}).</strong> {receipt.message}
              <div className="btn-row"><button className="btn btn-sm" onClick={() => setReceipt(null)}>Make another request</button></div>
            </div>
          )}
          {!receipt && !loading && !loadError && (
            services.length === 0 ? <p className="state">Online booking opens soon. Please contact us to arrange an appointment.</p> : (
              <form className="form" onSubmit={submit} noValidate={false}>
                {error && <p className="notice-error" role="alert">{error}</p>}
                <div className="field"><label htmlFor="b-service">Service</label>
                  <select id="b-service" required value={f.service_id} onChange={set("service_id")}>
                    <option value="">Select a service</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div className="two">
                  <div className="field"><label htmlFor="b-name">Your name</label><input id="b-name" required minLength={2} maxLength={100} value={f.customer_name} onChange={set("customer_name")} autoComplete="name" /></div>
                  <div className="field"><label htmlFor="b-phone">Contact number</label><input id="b-phone" required inputMode="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></div>
                </div>
                <div className="two">
                  <div className="field"><label htmlFor="b-date">Preferred date</label><input id="b-date" type="date" required min={today()} value={f.preferred_date} onChange={set("preferred_date")} /></div>
                  <div className="field"><label htmlFor="b-time">Preferred time</label><input id="b-time" type="time" required value={f.preferred_time} onChange={set("preferred_time")} /></div>
                </div>
                <div className="field"><label htmlFor="b-notes">Additional information (optional)</label><textarea id="b-notes" maxLength={1000} value={f.notes} onChange={set("notes")} /></div>
                <button className="btn btn-gold" disabled={busy}>{busy ? "Sending…" : "Submit request"}</button>
                <p className="demo-note">This is a request, not a confirmed booking. You'll be contacted once it is approved.</p>
              </form>
            )
          )}
        </div>
      </section>
    </>
  );
}

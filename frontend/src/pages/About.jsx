import { Link } from "react-router-dom";
import { IMG } from "../assets.js";
import Img from "../components/Img.jsx";
import { PageHero } from "../components/ui.jsx";

export default function About() {
  return (
    <>
      <PageHero eyebrow="About" title="The story behind the crown">Hair By Neo Malapane is a hair salon and hair retail brand based in Katlehong, Gauteng.</PageHero>
      <section className="section">
        <div className="container split">
          <Img className="feature-img" src={IMG.aboutNeo} alt="Portrait placeholder (demonstration image)" />
          <div>
            <p className="eyebrow">Meet Neo</p>
            <h2 className="serif">Neo Malapane</h2>
            <p className="muted">Neo's personal story, background and experience will be added here in Neo's own words.</p>
            <p className="demo-note">Content to be supplied by the business. No qualifications or achievements are listed until verified.</p>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container split">
          <div>
            <p className="eyebrow">Our Philosophy</p>
            <h2 className="serif">Hair is a statement.</h2>
            <p className="muted">We believe beautiful hair is about confidence. Our focus is quality hair, careful styling and a client experience that feels luxurious from the first message to the final mirror reveal.</p>
            <div className="btn-row"><Link to="/booking" className="btn btn-gold">Book Appointment</Link><Link to="/shop" className="btn">Shop Hair</Link></div>
          </div>
          <Img className="feature-img" src={IMG.aboutSalon} alt="Salon placeholder (demonstration image)" />
        </div>
      </section>
    </>
  );
}

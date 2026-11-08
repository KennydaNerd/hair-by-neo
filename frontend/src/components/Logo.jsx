import { useState } from "react";
import { IMG } from "../assets.js";

// Uses the business's ORIGINAL logo file unmodified. Until it is added at public/assets/logo/logo-original.png
// a plain text wordmark is shown; this is a temporary stand-in, not a redesign.
export default function Logo({ height = 56 }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <span className="wordmark">Hair By Neo Malapane</span>;
  return (
    <span className="logo-badge">
      <img src={IMG.logo} alt="Hair By Neo Malapane" style={{ height }} onError={() => setMissing(true)} />
    </span>
  );
}

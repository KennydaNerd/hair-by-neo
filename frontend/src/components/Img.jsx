import { useState } from "react";
import { IMG } from "../assets.js";
import { imgSrc } from "../services/api.js";

// Lazy-loaded image with a branded fallback so a missing file never leaves a broken box.
export default function Img({ src, alt, className = "", eager = false, ...rest }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? IMG.fallback : imgSrc(src)}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

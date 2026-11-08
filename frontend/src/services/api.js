export const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const TOKEN_KEY = "hbn_admin_token";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY));

// Images uploaded through the admin dashboard live on the API server.
export const imgSrc = (url) => (url && url.startsWith("/uploads") ? API_URL + url : url);

function messageFrom(data, status) {
  if (data && Array.isArray(data.detail)) {
    return data.detail.map((d) => (d.msg || "Invalid value").replace(/^Value error, /, "")).join(". ");
  }
  if (data && typeof data.detail === "string") return data.detail;
  return `Something went wrong (${status}). Please try again.`;
}

async function request(path, { method = "GET", body, form, auth = false } = {}) {
  const headers = {};
  let payload;
  if (auth) headers.Authorization = `Bearer ${getToken()}`;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Please check your connection and try again.");
  }
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    if (res.status === 401 && auth) { setToken(null); window.dispatchEvent(new Event("hbn-logout")); }
    throw new Error(messageFrom(data, res.status));
  }
  return data;
}

const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== "" && v != null && v !== false && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", form: new URLSearchParams({ username, password }) }),
  products: (filters = {}) => request(`/api/products${qs(filters)}`),
  services: () => request("/api/services"),
  gallery: () => request("/api/gallery"),
  requestAppointment: (body) => request("/api/appointments", { method: "POST", body }),
  sendEnquiry: (body) => request("/api/enquiries", { method: "POST", body }),
  admin: {
    dashboard: () => request("/api/dashboard", { auth: true }),
    appointments: () => request("/api/appointments", { auth: true }),
    setAppointmentStatus: (id, status) => request(`/api/appointments/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
    enquiries: () => request("/api/enquiries", { auth: true }),
    setEnquiryHandled: (id, handled) => request(`/api/enquiries/${id}`, { method: "PATCH", body: { handled }, auth: true }),
    createProduct: (b) => request("/api/products", { method: "POST", body: b, auth: true }),
    updateProduct: (id, b) => request(`/api/products/${id}`, { method: "PATCH", body: b, auth: true }),
    deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE", auth: true }),
    createService: (b) => request("/api/services", { method: "POST", body: b, auth: true }),
    updateService: (id, b) => request(`/api/services/${id}`, { method: "PATCH", body: b, auth: true }),
    deleteService: (id) => request(`/api/services/${id}`, { method: "DELETE", auth: true }),
    addGallery: (b) => request("/api/gallery", { method: "POST", body: b, auth: true }),
    deleteGallery: (id) => request(`/api/gallery/${id}`, { method: "DELETE", auth: true }),
    upload: (file) => { const f = new FormData(); f.append("file", file); return request("/api/gallery/upload", { method: "POST", form: f, auth: true }); },
  },
};

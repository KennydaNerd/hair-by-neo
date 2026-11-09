# Hair By Neo Malapane: luxury salon & hair shop

Full-stack website for a Katlehong salon and hair retailer: public site, booking requests, product enquiries and an admin dashboard.

**Live demo:** https://frontend-inky-three-34.vercel.app

> The backend is hosted on a free tier, so the first request after a quiet period can take up to a minute while it wakes up.

## Features

**Public site**
- Home, about, services and contact pages
- Shop with search, filters and product enquiries
- Gallery with lightbox
- Booking requests that stay pending until the owner responds

**Admin dashboard (JWT login)**
- Approve or reject appointments
- Manage enquiries, products and stock, services and gallery uploads

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite |
| Backend | Python, FastAPI, Pydantic |
| Database | SQLite |
| Auth | JWT, PBKDF2 password hashing |
| Testing | Pytest, FastAPI TestClient (9 automated API tests) |
| Deployment | Vercel (frontend), Render (backend) |

## Run locally (Windows PowerShell)

**Backend** (terminal 1):

```powershell
cd backend
copy .env.example .env      # then edit SECRET_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest
uvicorn main:app --reload   # API docs: http://127.0.0.1:8000/docs
```

**Frontend** (terminal 2):

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Admin dashboard: http://localhost:5173/admin

## Testing

From the `backend` folder, run `pytest`. The suite exercises the API through FastAPI's TestClient.

## Notes

- All demonstration images are AI-generated placeholder artwork and are labelled as such. No prices, testimonials or stock are invented.
- Never commit `.env` or the `.db` file.

## Author

Kgothatso Kenny Manyaka
Pretoria / Johannesburg, South Africa
[Email](mailto:manyakakgothatso7@gmail.com) · [LinkedIn](https://linkedin.com/in/kgothatso-manyaka-00036627b) · [GitHub](https://github.com/KennydaNerd)

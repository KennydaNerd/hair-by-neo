# Hair By Neo Malapane: luxury salon & hair shop

Full-stack site: React (Vite) frontend, FastAPI backend, SQLite database.

## Run locally (Windows PowerShell)
Backend (terminal 1):
```powershell
cd backend
copy .env.example .env      # then edit SECRET_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest
uvicorn main:app --reload   # http://127.0.0.1:8000/docs
```
Frontend (terminal 2):
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev                 # http://localhost:5173
```
Admin dashboard: http://localhost:5173/admin

## Features
Public: home, about, services, shop (search, filters, enquiries), gallery with lightbox, booking requests (stay pending), contact.
Admin (JWT login): approve/reject appointments, enquiries, products and stock, services, gallery uploads.

## Notes
All demonstration images are AI/generated placeholder artwork and are labelled as such. No prices, testimonials or stock are invented.
Never commit `.env` or the `.db` file.

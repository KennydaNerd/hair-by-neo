from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database import init_db
from routes import appointments, auth, dashboard, enquiries, gallery, products, services
from seed_demo import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_if_empty()
    get_settings().upload_dir.mkdir(exist_ok=True)
    yield


app = FastAPI(title="Hair By Neo Malapane API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

for module in (auth, products, services, appointments, enquiries, gallery, dashboard):
    app.include_router(module.router)

get_settings().upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=get_settings().upload_dir), name="uploads")


@app.get("/api/health", tags=["System"])
def health():
    return {"status": "ok"}

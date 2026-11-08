import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from config import get_settings
from database import get_conn
from schemas import GalleryCreate, GalleryOut
from security import require_admin

router = APIRouter(prefix="/api/gallery", tags=["Gallery"])

ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_BYTES = 5 * 1024 * 1024


def _out(row) -> GalleryOut:
    d = dict(row)
    d["is_demo"] = bool(d["is_demo"])
    d.pop("created_at", None)
    return GalleryOut(**d)


@router.get("", response_model=list[GalleryOut])
def list_gallery():
    with get_conn() as conn:
        return [_out(r) for r in conn.execute("SELECT * FROM gallery_images ORDER BY id DESC").fetchall()]


@router.post("", response_model=GalleryOut, status_code=status.HTTP_201_CREATED)
def add_gallery_image(body: GalleryCreate, _: str = Depends(require_admin)):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO gallery_images (title, category, image_url) VALUES (?,?,?)",
            (body.title, body.category, body.image_url),
        )
        row = conn.execute("SELECT * FROM gallery_images WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _out(row)


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gallery_image(image_id: int, _: str = Depends(require_admin)):
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM gallery_images WHERE id = ?", (image_id,))
    if cur.rowcount == 0:
        raise HTTPException(404, "Image not found")


@router.post("/upload", tags=["Uploads"])
async def upload_image(file: UploadFile = File(...), _: str = Depends(require_admin)):
    """Admin: upload a JPEG/PNG/WebP (max 5 MB). Returns a URL usable as image_url."""
    ext = ALLOWED.get(file.content_type or "")
    if not ext:
        raise HTTPException(415, "Only JPEG, PNG or WebP images are allowed")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image must be 5 MB or smaller")
    upload_dir: Path = get_settings().upload_dir
    upload_dir.mkdir(exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    (upload_dir / name).write_bytes(data)
    return {"url": f"/uploads/{name}"}

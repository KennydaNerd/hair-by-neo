from fastapi import APIRouter, Depends, HTTPException, status

from database import get_conn
from schemas import ServiceCreate, ServiceOut, ServiceUpdate
from security import require_admin

router = APIRouter(prefix="/api/services", tags=["Services"])


def _out(row) -> ServiceOut:
    d = dict(row)
    d["bookable"] = bool(d["bookable"])
    d["is_demo"] = bool(d["is_demo"])
    d.pop("created_at", None)
    return ServiceOut(**d)


@router.get("", response_model=list[ServiceOut])
def list_services():
    with get_conn() as conn:
        return [_out(r) for r in conn.execute("SELECT * FROM services ORDER BY id").fetchall()]


@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(body: ServiceCreate, _: str = Depends(require_admin)):
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO services (name, description, price, duration_minutes, image_url, bookable) VALUES (?,?,?,?,?,?)",
            (body.name, body.description, body.price, body.duration_minutes, body.image_url, int(body.bookable)),
        )
        row = conn.execute("SELECT * FROM services WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _out(row)


@router.patch("/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, body: ServiceUpdate, _: str = Depends(require_admin)):
    changes = body.model_dump(exclude_unset=True)
    if "bookable" in changes:
        changes["bookable"] = int(changes["bookable"])
    with get_conn() as conn:
        if not conn.execute("SELECT 1 FROM services WHERE id = ?", (service_id,)).fetchone():
            raise HTTPException(404, "Service not found")
        if changes:
            cols = ", ".join(f"{k} = ?" for k in changes)
            conn.execute(f"UPDATE services SET {cols}, is_demo = 0 WHERE id = ?", [*changes.values(), service_id])
        row = conn.execute("SELECT * FROM services WHERE id = ?", (service_id,)).fetchone()
    return _out(row)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, _: str = Depends(require_admin)):
    with get_conn() as conn:
        used = conn.execute("SELECT COUNT(*) FROM appointments WHERE service_id = ?", (service_id,)).fetchone()[0]
        if used:
            raise HTTPException(409, "This service has appointments. Turn off booking instead of deleting it.")
        cur = conn.execute("DELETE FROM services WHERE id = ?", (service_id,))
    if cur.rowcount == 0:
        raise HTTPException(404, "Service not found")

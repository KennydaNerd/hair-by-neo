from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from database import get_conn
from schemas import AppointmentCreate, AppointmentOut, AppointmentReceipt, AppointmentStatusUpdate
from security import require_admin

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

BASE_SQL = """SELECT a.*, s.name AS service_name FROM appointments a
              LEFT JOIN services s ON s.id = a.service_id"""


@router.post("", response_model=AppointmentReceipt, status_code=status.HTTP_201_CREATED)
def request_appointment(body: AppointmentCreate):
    """Public: creates a PENDING request. Nothing is confirmed until the owner approves it."""
    with get_conn() as conn:
        service = conn.execute("SELECT bookable FROM services WHERE id = ?", (body.service_id,)).fetchone()
        if not service:
            raise HTTPException(404, "Selected service does not exist")
        if not service["bookable"]:
            raise HTTPException(409, "This service is not currently available for booking")
        cur = conn.execute(
            """INSERT INTO appointments (service_id, customer_name, phone, preferred_date, preferred_time, notes)
               VALUES (?,?,?,?,?,?)""",
            (body.service_id, body.customer_name, body.phone, body.preferred_date.isoformat(),
             body.preferred_time, body.notes),
        )
    return AppointmentReceipt(
        id=cur.lastrowid,
        status="pending",
        message="Your request has been received. It is pending approval and is not a confirmed booking yet.",
    )


@router.get("", response_model=list[AppointmentOut])
def list_appointments(status_filter: Optional[str] = None, _: str = Depends(require_admin)):
    sql, params = BASE_SQL, []
    if status_filter:
        sql += " WHERE a.status = ?"
        params.append(status_filter)
    sql += " ORDER BY a.preferred_date, a.preferred_time"
    with get_conn() as conn:
        return [AppointmentOut(**dict(r)) for r in conn.execute(sql, params).fetchall()]


@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def set_status(appointment_id: int, body: AppointmentStatusUpdate, _: str = Depends(require_admin)):
    with get_conn() as conn:
        cur = conn.execute("UPDATE appointments SET status = ? WHERE id = ?", (body.status, appointment_id))
        if cur.rowcount == 0:
            raise HTTPException(404, "Appointment not found")
        row = conn.execute(BASE_SQL + " WHERE a.id = ?", (appointment_id,)).fetchone()
    return AppointmentOut(**dict(row))

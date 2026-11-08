from fastapi import APIRouter, Depends

from database import get_conn
from schemas import DashboardOut
from security import require_admin

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
def summary(_: str = Depends(require_admin)):
    def one(conn, sql):
        return conn.execute(sql).fetchone()[0]

    with get_conn() as conn:
        return DashboardOut(
            pending_appointments=one(conn, "SELECT COUNT(*) FROM appointments WHERE status='pending'"),
            approved_appointments=one(conn, "SELECT COUNT(*) FROM appointments WHERE status='approved'"),
            total_appointments=one(conn, "SELECT COUNT(*) FROM appointments"),
            unhandled_enquiries=one(conn, "SELECT COUNT(*) FROM enquiries WHERE handled=0"),
            products=one(conn, "SELECT COUNT(*) FROM products"),
            out_of_stock=one(conn, "SELECT COUNT(*) FROM products WHERE stock_status='out_of_stock'"),
            services=one(conn, "SELECT COUNT(*) FROM services"),
        )

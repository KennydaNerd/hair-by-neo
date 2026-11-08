from fastapi import APIRouter, Depends, HTTPException, status

from database import get_conn
from schemas import EnquiryCreate, EnquiryHandledUpdate, EnquiryOut
from security import require_admin

router = APIRouter(prefix="/api/enquiries", tags=["Enquiries"])

BASE_SQL = """SELECT e.*, p.name AS product_name FROM enquiries e
              LEFT JOIN products p ON p.id = e.product_id"""


def _out(row) -> EnquiryOut:
    d = dict(row)
    d["handled"] = bool(d["handled"])
    return EnquiryOut(**d)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_enquiry(body: EnquiryCreate):
    with get_conn() as conn:
        if body.product_id is not None and not conn.execute(
            "SELECT 1 FROM products WHERE id = ?", (body.product_id,)
        ).fetchone():
            raise HTTPException(404, "Product not found")
        cur = conn.execute(
            "INSERT INTO enquiries (name, phone, email, message, product_id) VALUES (?,?,?,?,?)",
            (body.name, body.phone, body.email, body.message, body.product_id),
        )
    return {"id": cur.lastrowid, "message": "Thank you. Your enquiry has been received."}


@router.get("", response_model=list[EnquiryOut])
def list_enquiries(_: str = Depends(require_admin)):
    with get_conn() as conn:
        return [_out(r) for r in conn.execute(BASE_SQL + " ORDER BY e.id DESC").fetchall()]


@router.patch("/{enquiry_id}", response_model=EnquiryOut)
def set_handled(enquiry_id: int, body: EnquiryHandledUpdate, _: str = Depends(require_admin)):
    with get_conn() as conn:
        cur = conn.execute("UPDATE enquiries SET handled = ? WHERE id = ?", (int(body.handled), enquiry_id))
        if cur.rowcount == 0:
            raise HTTPException(404, "Enquiry not found")
        row = conn.execute(BASE_SQL + " WHERE e.id = ?", (enquiry_id,)).fetchone()
    return _out(row)

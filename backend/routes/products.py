from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from database import get_conn
from schemas import ProductCreate, ProductOut, ProductUpdate
from security import require_admin

router = APIRouter(prefix="/api/products", tags=["Products"])


def _out(row) -> ProductOut:
    d = dict(row)
    d["is_demo"] = bool(d["is_demo"])
    d.pop("created_at", None)
    return ProductOut(**d)


@router.get("", response_model=list[ProductOut])
def list_products(
    q: Optional[str] = Query(None, max_length=60),
    category: Optional[str] = None,
    texture: Optional[str] = None,
    in_stock_only: bool = False,
):
    sql, params = "SELECT * FROM products WHERE 1=1", []
    if q:
        sql += " AND (name LIKE ? OR description LIKE ?)"
        params += [f"%{q}%", f"%{q}%"]
    if category:
        sql += " AND category = ?"
        params.append(category)
    if texture:
        sql += " AND texture = ?"
        params.append(texture)
    if in_stock_only:
        sql += " AND stock_status IN ('in_stock','low_stock')"
    sql += " ORDER BY id DESC"
    with get_conn() as conn:
        return [_out(r) for r in conn.execute(sql, params).fetchall()]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Product not found")
    return _out(row)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(body: ProductCreate, _: str = Depends(require_admin)):
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO products (name, category, texture, length_inches, description, price, stock_status, image_url)
               VALUES (?,?,?,?,?,?,?,?)""",
            (body.name, body.category, body.texture, body.length_inches, body.description,
             body.price, body.stock_status, body.image_url),
        )
        row = conn.execute("SELECT * FROM products WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _out(row)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, body: ProductUpdate, _: str = Depends(require_admin)):
    changes = body.model_dump(exclude_unset=True)
    with get_conn() as conn:
        if not conn.execute("SELECT 1 FROM products WHERE id = ?", (product_id,)).fetchone():
            raise HTTPException(404, "Product not found")
        if changes:
            cols = ", ".join(f"{k} = ?" for k in changes)  # keys come from the Pydantic model, never from the client
            conn.execute(f"UPDATE products SET {cols}, is_demo = 0 WHERE id = ?", [*changes.values(), product_id])
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    return _out(row)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, _: str = Depends(require_admin)):
    with get_conn() as conn:
        conn.execute("UPDATE enquiries SET product_id = NULL WHERE product_id = ?", (product_id,))
        cur = conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    if cur.rowcount == 0:
        raise HTTPException(404, "Product not found")

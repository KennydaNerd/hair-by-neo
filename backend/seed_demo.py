"""Demonstration listings so the site is presentable before Neo supplies real data.

Everything seeded here is flagged is_demo=1, has NO price and NO stock claim, and uses generated
placeholder artwork. Editing an item in the admin dashboard clears its demo flag. To start clean,
delete the demo rows from the dashboard (or delete hairbyneo.db).
Set SEED_DEMO=0 in .env to disable seeding entirely.
"""
import os

from database import get_conn

SERVICES = [
    ("Frontal Installation", "installation"),
    ("Closure Installation", "installation"),
    ("Hair Styling", "styling"),
    ("Consultation", "consultation"),
]
PRODUCTS = [
    ("Brazilian Straight Bundles", "Bundles", "Straight", "brazilian-straight"),
    ("Body Wave Bundles", "Bundles", "Body Wave", "body-wave"),
    ("Deep Wave Bundles", "Bundles", "Deep Wave", "deep-wave"),
    ("Curly Bundles", "Bundles", "Curly", "curly"),
    ("Lace Frontal", "Frontals", "Straight", "lace-frontal"),
    ("Hair Extension Collection", "Extensions", None, "extensions"),
]
GALLERY = [
    ("Sleek frontal installation", "Frontals", "sleek-frontal"),
    ("Straight style", "Straight", "straight"),
    ("Body wave style", "Body Wave", "body-wave"),
    ("Curly style", "Curly", "curly"),
    ("Bob style", "Bobs", "bob"),
    ("Long flowing style", "Long Styles", "long-flowing"),
]


def seed_if_empty() -> None:
    if os.getenv("SEED_DEMO", "1") == "0":
        return
    with get_conn() as conn:
        if conn.execute("SELECT COUNT(*) FROM services").fetchone()[0] == 0:
            for name, slug in SERVICES:
                conn.execute(
                    "INSERT INTO services (name, description, image_url, is_demo) VALUES (?,?,?,1)",
                    (name, "Demonstration listing. Description, price and duration to be supplied by the business.",
                     f"/assets/services/{slug}.svg"),
                )
        if conn.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
            for name, cat, texture, slug in PRODUCTS:
                conn.execute(
                    """INSERT INTO products (name, category, texture, description, stock_status, image_url, is_demo)
                       VALUES (?,?,?,?, 'enquire', ?, 1)""",
                    (name, cat, texture, "Demonstration listing. Lengths, price and availability on enquiry.",
                     f"/assets/products/{slug}.svg"),
                )
        if conn.execute("SELECT COUNT(*) FROM gallery_images").fetchone()[0] == 0:
            for title, cat, slug in GALLERY:
                conn.execute(
                    "INSERT INTO gallery_images (title, category, image_url, is_demo) VALUES (?,?,?,1)",
                    (title, cat, f"/assets/gallery/{slug}.svg"),
                )

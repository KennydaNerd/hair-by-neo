from datetime import date, timedelta

FUTURE = (date.today() + timedelta(days=7)).isoformat()


def test_login_rejects_bad_password(client):
    assert client.post("/api/auth/login", data={"username": "admin", "password": "nope"}).status_code == 401


def test_admin_routes_require_token(client):
    assert client.get("/api/appointments").status_code == 401
    assert client.post("/api/products", json={"name": "X1", "category": "Bundles"}).status_code == 401
    assert client.get("/api/dashboard").status_code == 401


def test_product_crud(client, auth):
    r = client.post("/api/products", json={"name": "Test Bundle", "category": "Bundles", "price": 100}, headers=auth)
    assert r.status_code == 201
    pid = r.json()["id"]
    assert client.get(f"/api/products/{pid}").json()["price"] == 100
    r = client.patch(f"/api/products/{pid}", json={"stock_status": "in_stock", "price": 150}, headers=auth)
    assert r.json()["stock_status"] == "in_stock" and r.json()["price"] == 150
    assert any(p["id"] == pid for p in client.get("/api/products?in_stock_only=true").json())
    assert client.delete(f"/api/products/{pid}", headers=auth).status_code == 204
    assert client.get(f"/api/products/{pid}").status_code == 404


def test_product_validation(client, auth):
    assert client.post("/api/products", json={"name": "A", "category": "Bundles"}, headers=auth).status_code == 422
    r = client.post("/api/products", json={"name": "Okay", "category": "Bundles", "price": -5}, headers=auth)
    assert r.status_code == 422


def test_booking_flow_stays_pending_until_approved(client, auth):
    sid = client.post("/api/services", json={"name": "Test Service"}, headers=auth).json()["id"]
    body = {"service_id": sid, "customer_name": "Test Client", "phone": "0710000000",
            "preferred_date": FUTURE, "preferred_time": "10:30", "notes": "hello"}
    r = client.post("/api/appointments", json=body)
    assert r.status_code == 201 and r.json()["status"] == "pending"
    aid = r.json()["id"]
    listed = client.get("/api/appointments?status_filter=pending", headers=auth).json()
    assert any(a["id"] == aid for a in listed)
    r = client.patch(f"/api/appointments/{aid}/status", json={"status": "approved"}, headers=auth)
    assert r.status_code == 200 and r.json()["status"] == "approved"
    assert client.patch(f"/api/appointments/{aid}/status", json={"status": "bogus"}, headers=auth).status_code == 422
    assert client.delete(f"/api/services/{sid}", headers=auth).status_code == 409


def test_booking_validation(client, auth):
    sid = client.post("/api/services", json={"name": "Validation Service"}, headers=auth).json()["id"]
    base = {"service_id": sid, "customer_name": "Test Client", "phone": "0710000000",
            "preferred_date": FUTURE, "preferred_time": "10:30"}
    assert client.post("/api/appointments", json={**base, "preferred_date": "2020-01-01"}).status_code == 422
    assert client.post("/api/appointments", json={**base, "phone": "abc"}).status_code == 422
    assert client.post("/api/appointments", json={**base, "preferred_time": "25:99"}).status_code == 422
    assert client.post("/api/appointments", json={**base, "service_id": 99999}).status_code == 404
    client.patch(f"/api/services/{sid}", json={"bookable": False}, headers=auth)
    assert client.post("/api/appointments", json=base).status_code == 409


def test_enquiry_and_dashboard(client, auth):
    r = client.post("/api/enquiries", json={"name": "Ask Er", "phone": "+27710000000", "message": "Do you have 20 inch?"})
    assert r.status_code == 201
    assert client.post("/api/enquiries", json={"name": "Ask Er", "phone": "bad", "message": "hello there"}).status_code == 422
    stats = client.get("/api/dashboard", headers=auth).json()
    assert stats["unhandled_enquiries"] >= 1


def test_gallery_upload_rejects_non_images(client, auth):
    r = client.post("/api/gallery/upload", files={"file": ("x.txt", b"hello", "text/plain")}, headers=auth)
    assert r.status_code == 415

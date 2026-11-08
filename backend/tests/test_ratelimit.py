from routes import auth as auth_routes


def test_login_is_rate_limited_after_repeated_failures(client):
    auth_routes._failures.clear()
    codes = [client.post("/api/auth/login", data={"username": "admin", "password": "wrong"}).status_code for _ in range(9)]
    assert codes[:8] == [401] * 8
    assert codes[8] == 429
    auth_routes._failures.clear()
    ok = client.post("/api/auth/login", data={"username": "admin", "password": "correct-horse-battery"})
    assert ok.status_code == 200

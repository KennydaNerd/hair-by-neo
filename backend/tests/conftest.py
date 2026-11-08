import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
_tmp = tempfile.mkdtemp()
os.environ.update(
    DATABASE_PATH=str(Path(_tmp) / "test.db"),
    SECRET_KEY="test-secret-key-0123456789",
    ADMIN_USERNAME="admin",
    ADMIN_PASSWORD="correct-horse-battery",
    SEED_DEMO="0",
)

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def auth(client):
    r = client.post("/api/auth/login", data={"username": "admin", "password": "correct-horse-battery"})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

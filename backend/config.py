"""Environment-based configuration. Values come from .env (loaded manually, no extra dependency)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def _load_env_file() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


_load_env_file()


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", "")
    admin_username: str = os.getenv("ADMIN_USERNAME", "")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "")
    cors_origins: list[str] = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
    database_path: str = os.getenv("DATABASE_PATH", str(BASE_DIR / "hairbyneo.db"))
    token_expire_minutes: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "480"))
    upload_dir: Path = BASE_DIR / "uploads"


def get_settings() -> Settings:
    # Re-read each call so tests can change the environment.
    s = Settings()
    s.secret_key = os.getenv("SECRET_KEY", "")
    s.admin_username = os.getenv("ADMIN_USERNAME", "")
    s.admin_password = os.getenv("ADMIN_PASSWORD", "")
    s.database_path = os.getenv("DATABASE_PATH", s.database_path)
    return s

import os
import re
from pathlib import Path
from fastapi import HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address


limiter = Limiter(key_func=get_remote_address)

ALLOWED_EXTENSIONS = {".pdf"}
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Path traversal pattern
_PATH_TRAVERSAL = re.compile(r"\.\.")


def sanitize_filename(filename: str) -> str:
    """Remove path traversal and invalid chars from filename."""
    if _PATH_TRAVERSAL.search(filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename",
        )
    # Keep only safe characters
    safe = re.sub(r"[^\w\s\-\.()áéíóúÁÉÍÓÚñÑüÜ ]", "", filename)
    if not safe or not safe.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename",
        )
    return safe.strip()


def validate_file_path(module_slug: str, filename: str, content_dir: Path) -> Path:
    """Resolve and validate a file path is within the content directory."""
    safe_filename = sanitize_filename(filename)
    module_map = {
        "modulo1": "Modulo1",
        "modulo2": "Modulo2",
        "modulo3": "Modulo3",
        "modulo4": "Modulo4",
        "modulo5": "Modulo5",
        "modulo6": "Modulo6",
    }
    module_dir_name = module_map.get(module_slug)
    if not module_dir_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    file_path = (content_dir / module_dir_name / safe_filename).resolve()

    # Ensure resolved path is within content_dir
    try:
        file_path.relative_to(content_dir.resolve())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    ext = file_path.suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="File type not allowed",
        )

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return file_path


SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "font-src 'self' data:;"
    ),
}

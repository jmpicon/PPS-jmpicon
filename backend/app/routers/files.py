import urllib.parse
from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

from app.data import CONTENT_DIR
from app.security import limiter, validate_file_path, SECURITY_HEADERS

router = APIRouter(prefix="/api/files", tags=["files"])

CONTENT_TYPE_MAP = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
}


@router.get("/{module_slug}/{filename}")
@limiter.limit("30/minute")
async def serve_file(module_slug: str, filename: str, request: Request):
    """Serve a course file with security validation."""
    decoded_filename = urllib.parse.unquote(filename)
    file_path = validate_file_path(module_slug, decoded_filename, CONTENT_DIR)

    ext = file_path.suffix.lower()
    content_type = CONTENT_TYPE_MAP.get(ext, "application/octet-stream")

    # Safe filename for Content-Disposition
    safe_name = urllib.parse.quote(file_path.name)

    headers = {
        **SECURITY_HEADERS,
        "Content-Disposition": f'inline; filename="{safe_name}"',
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
    }

    return FileResponse(
        path=str(file_path),
        media_type=content_type,
        headers=headers,
        filename=file_path.name,
    )

from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse

from app.data import MODULE_META, CONTENT_DIR, get_file_description
from app.models.module import SearchResult, CourseFile, FileType
from app.routers.modules import _scan_module_files
from app.security import limiter, SECURITY_HEADERS

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=list[SearchResult])
@limiter.limit("30/minute")
async def search_files(
    request: Request,
    q: str = Query(..., min_length=2, max_length=100),
):
    """Full-text search across all module files by filename."""
    q_lower = q.lower().strip()
    results: list[SearchResult] = []

    for meta in MODULE_META:
        files = _scan_module_files(meta["dir"], meta["slug"])
        for f in files:
            if q_lower in f.name.lower() or q_lower in (f.description or "").lower():
                results.append(
                    SearchResult(
                        module_id=meta["id"],
                        module_title=meta["title"],
                        module_slug=meta["slug"],
                        file=f,
                    )
                )

    return JSONResponse(
        content=[r.model_dump() for r in results],
        headers=SECURITY_HEADERS,
    )

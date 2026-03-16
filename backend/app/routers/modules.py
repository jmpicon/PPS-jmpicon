import re
from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.data import MODULE_META, CONTENT_DIR, get_file_description
from app.models.module import Module, ModuleList, CourseFile, FileType, StatsResponse
from app.security import limiter, SECURITY_HEADERS

router = APIRouter(prefix="/api/modules", tags=["modules"])

EXTENSION_TYPE: dict[str, FileType] = {
    ".pdf": FileType.PDF,
}

# Archivos a excluir: versiones genéricas sin "_José_Picón"
# Patrón: Modulo\d+.pdf  e  Introduccion.pdf
_EXCLUDE = re.compile(r'^(Modulo\d+|Introduccion)\.pdf$', re.IGNORECASE)


def _scan_module_files(module_dir: str, module_slug: str) -> list[CourseFile]:
    """Scan a module directory and return a list of CourseFile objects."""
    dir_path = CONTENT_DIR / module_dir
    files: list[CourseFile] = []

    if not dir_path.exists():
        return files

    for f in sorted(dir_path.iterdir()):
        if f.is_dir():
            for sf in sorted(f.iterdir()):
                if sf.is_file() and sf.suffix.lower() in EXTENSION_TYPE and not _EXCLUDE.match(sf.name):
                    files.append(_make_course_file(sf, module_slug))
        elif f.is_file() and f.suffix.lower() in EXTENSION_TYPE and not _EXCLUDE.match(f.name):
            files.append(_make_course_file(f, module_slug))

    return files


def _make_course_file(path: Path, module_slug: str) -> CourseFile:
    ext = path.suffix.lower()
    return CourseFile(
        name=path.stem,
        filename=path.name,
        type=EXTENSION_TYPE.get(ext, FileType.OTHER),
        size=path.stat().st_size,
        url=f"/api/files/{module_slug}/{path.name}",
        description=get_file_description(path.name),
    )


def _build_module(meta: dict) -> Module:
    files = _scan_module_files(meta["dir"], meta["slug"])
    return Module(
        id=meta["id"],
        slug=meta["slug"],
        title=meta["title"],
        subtitle=meta["subtitle"],
        description=meta["description"],
        icon=meta["icon"],
        color=meta["color"],
        topics=meta["topics"],
        files=files,
        total_files=len(files),
    )


@router.get("", response_model=ModuleList)
@limiter.limit("60/minute")
async def list_modules(request: Request):
    modules = [_build_module(m) for m in MODULE_META]
    return JSONResponse(
        content=ModuleList(modules=modules, total=len(modules)).model_dump(),
        headers=SECURITY_HEADERS,
    )


@router.get("/stats", response_model=StatsResponse)
@limiter.limit("60/minute")
async def get_stats(request: Request):
    modules = [_build_module(m) for m in MODULE_META]
    all_files = [f for m in modules for f in m.files]
    stats = StatsResponse(
        total_modules=len(modules),
        total_files=len(all_files),
        total_pdfs=sum(1 for f in all_files if f.type == FileType.PDF),
        total_docs=sum(1 for f in all_files if f.type == FileType.DOCX),
        total_slides=sum(1 for f in all_files if f.type == FileType.PPTX),
        vulnerabilities_covered=13,
    )
    return JSONResponse(content=stats.model_dump(), headers=SECURITY_HEADERS)


@router.get("/{slug}", response_model=Module)
@limiter.limit("60/minute")
async def get_module(slug: str, request: Request):
    meta = next((m for m in MODULE_META if m["slug"] == slug), None)
    if not meta:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    module = _build_module(meta)
    return JSONResponse(content=module.model_dump(), headers=SECURITY_HEADERS)

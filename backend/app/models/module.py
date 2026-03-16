from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class FileType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    PPTX = "pptx"
    OTHER = "other"


class CourseFile(BaseModel):
    name: str
    filename: str
    type: FileType
    size: int
    url: str
    description: Optional[str] = None


class Module(BaseModel):
    id: int
    slug: str
    title: str
    subtitle: str
    description: str
    icon: str
    color: str
    topics: list[str]
    files: list[CourseFile] = Field(default_factory=list)
    total_files: int = 0


class ModuleList(BaseModel):
    modules: list[Module]
    total: int


class SearchResult(BaseModel):
    module_id: int
    module_title: str
    module_slug: str
    file: CourseFile


class StatsResponse(BaseModel):
    total_modules: int
    total_files: int
    total_pdfs: int
    total_docs: int
    total_slides: int
    vulnerabilities_covered: int

export type FileType = 'pdf' | 'docx' | 'pptx' | 'other'

export interface CourseFile {
  name: string
  filename: string
  type: FileType
  size: number
  url: string
  description: string | null
}

export interface Module {
  id: number
  slug: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  topics: string[]
  files: CourseFile[]
  total_files: number
}

export interface ModuleList {
  modules: Module[]
  total: number
}

export interface SearchResult {
  module_id: number
  module_title: string
  module_slug: string
  file: CourseFile
}

export interface Stats {
  total_modules: number
  total_files: number
  total_pdfs: number
  total_docs: number
  total_slides: number
  vulnerabilities_covered: number
}

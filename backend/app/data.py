"""
Static course catalogue — module metadata and file listings.
Files are discovered at runtime from the filesystem; this holds
descriptions, topics and colour theming.
"""
import os
from pathlib import Path
from typing import Optional

# En Docker: CONTENT_DIR=/content (env var del compose)
# En desarrollo local: ruta raíz del proyecto (CursoPPS/)
_default = Path(__file__).resolve().parent.parent.parent
CONTENT_DIR = Path(os.environ.get("CONTENT_DIR", str(_default)))

MODULE_META: list[dict] = [
    {
        "id": 1,
        "slug": "modulo1",
        "dir": "Modulo1",
        "title": "Introducción a la Seguridad Web",
        "subtitle": "OWASP Top Ten 2025 y Normativas",
        "description": (
            "Fundamentos de ciberseguridad web, análisis del OWASP Top Ten 2025 "
            "y comprensión de las normativas de seguridad."
        ),
        "icon": "shield",
        "color": "#00ff88",
        "topics": [
            "OWASP Top Ten 2025",
            "Fundamentos de ciberseguridad",
            "Normativas de seguridad web",
            "Marco regulatorio",
        ],
    },
    {
        "id": 2,
        "slug": "modulo2",
        "dir": "Modulo2",
        "title": "Vulnerabilidades de Datos de Entrada",
        "subtitle": "Inyecciones y ataques del lado cliente",
        "description": (
            "Explotación y mitigación de SQL Injection, XSS, CSRF, RCE, "
            "XXE, LFI/RFI, SSRF y deserialización insegura."
        ),
        "icon": "bug",
        "color": "#ff4757",
        "topics": [
            "SQL Injection (SQLi)",
            "Cross-Site Scripting (XSS)",
            "Cross-Site Request Forgery (CSRF)",
            "Remote Code Execution (RCE)",
            "XML External Entities (XXE)",
            "Local/Remote File Inclusion (LFI/RFI)",
            "Server-Side Request Forgery (SSRF)",
            "Deserialización insegura",
        ],
    },
    {
        "id": 3,
        "slug": "modulo3",
        "dir": "Modulo3",
        "title": "Autenticación y Gestión de Sesiones",
        "subtitle": "Broken Auth, JWT y OAuth",
        "description": (
            "Explotación y mitigación de broken authentication, gestión insegura "
            "de sesiones, manipulación JWT y fallos OAuth."
        ),
        "icon": "lock",
        "color": "#ffa502",
        "topics": [
            "Broken Authentication",
            "Gestión insegura de sesiones",
            "Manipulación de JWT",
            "OAuth inseguro",
        ],
    },
    {
        "id": 4,
        "slug": "modulo4",
        "dir": "Modulo4",
        "title": "Protección de Datos y Control de Acceso",
        "subtitle": "TLS, AES, RBAC y ABAC",
        "description": (
            "Configuración segura de TLS, cifrado AES, implementación de "
            "control de acceso basado en roles y atributos."
        ),
        "icon": "database",
        "color": "#00d4ff",
        "topics": [
            "Configuración segura TLS/SSL",
            "Cifrado AES de datos sensibles",
            "Role-Based Access Control (RBAC)",
            "Attribute-Based Access Control (ABAC)",
        ],
    },
    {
        "id": 5,
        "slug": "modulo5",
        "dir": "Modulo5",
        "title": "Configuración y Monitorización",
        "subtitle": "CSP, HSTS, Headers y Logging",
        "description": (
            "Implementación de Content Security Policy, HSTS, corrección "
            "de misconfigurations y estrategias de logging & monitoring."
        ),
        "icon": "monitor",
        "color": "#a29bfe",
        "topics": [
            "Content Security Policy (CSP)",
            "HTTP Strict Transport Security (HSTS)",
            "Security Misconfiguration",
            "Logging & Monitoring",
        ],
    },
    {
        "id": 6,
        "slug": "modulo6",
        "dir": "Modulo6",
        "title": "Testing de Seguridad",
        "subtitle": "SAST, DAST, Dependency-Check y ZAP",
        "description": (
            "Análisis de código estático (SAST), dinámico (DAST), "
            "análisis de dependencias y escaneo con OWASP ZAP."
        ),
        "icon": "search",
        "color": "#fd79a8",
        "topics": [
            "SAST — Análisis estático",
            "DAST — Análisis dinámico",
            "Dependency-Check",
            "OWASP ZAP",
        ],
    },
]

FILE_DESCRIPTIONS: dict[str, str] = {
    "Introduccion": "Presentación introductoria del módulo",
    "Modulo": "Guía completa del módulo",
    "pwning": "Ejercicio práctico con OWASP Juice Shop",
    "M1-A1": "Actividad 1: Análisis del OWASP Top Ten 2025",
    "M1-A2": "Actividad 2: Normativas de Seguridad Web",
    "M2-A1": "Actividad 1: SQL Injection",
    "M2-A2": "Actividad 2: Cross-Site Scripting",
    "M2-A3": "Actividad 3: CSRF",
    "M2-A4": "Actividad 4: RCE",
    "M2-A5": "Actividad 5: Deserialización insegura",
    "M2-A6": "Actividad 6: SSRF",
    "M2-A7": "Actividad 7: XXE",
    "M2-A8": "Actividad 8: Local File Inclusion (LFI)",
    "M2-A9": "Actividad 9: Remote File Inclusion (RFI)",
    "Deshabilitar seguridad Apache": "Configuración: Deshabilitar seguridad en Apache",
    "Deshablitar Seguridad PHP": "Configuración: Deshabilitar seguridad en PHP",
    "M3-A1": "Actividad 1: Broken Authentication",
    "M3-A2": "Actividad 2: Gestión insegura de sesiones",
    "M3-A3": "Actividad 3: Manipulación JWT",
    "M3-A4": "Actividad 4: OAuth inseguro",
    "M4-A1": "Actividad 1: Configuración TLS y Cifrado AES",
    "M4-A2": "Actividad 2: Role-Based Access Control (RBAC)",
    "M4-A3": "Actividad 3: Attribute-Based Access Control (ABAC)",
    "M5-A1": "Actividad 1: Content Security Policy",
    "M5-A2": "Actividad 2: HSTS",
    "M5-A3": "Actividad 3: Security Misconfiguration",
    "M5-A4": "Actividad 4: Logging & Monitoring",
    "M6-A1": "Actividad 1: SAST",
    "M6-A2": "Actividad 2: DAST",
    "M6-A3": "Actividad 3: Dependency-Check",
    "M6-A4": "Actividad 4: OWASP ZAP",
}


def get_file_description(filename: str) -> Optional[str]:
    for key, desc in FILE_DESCRIPTIONS.items():
        if key in filename:
            return desc
    return None

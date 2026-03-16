# CursoPPS — Plataforma de Puesta en Producción Segura

Plataforma web educativa para el curso de **Puesta en Producción Segura**, con material de estudio interactivo, quizzes Kahoot multijugador y terminal Kali Linux en el navegador.

---

## Instalación rápida

### Requisitos

- **Docker** >= 24
- **Docker Compose** >= 2.20
- ~2 GB libres en disco (imagen Kali Linux ~1 GB)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jmpicon/CursoPPS.git
cd CursoPPS

# 2. Copiar y ajustar variables de entorno
cp .env.example .env
# Editar .env: cambia ACCESS_CODE y SECRET_KEY

# 3. Añadir los PDFs del curso
# Coloca los archivos en Modulo1/ … Modulo6/
# Solo se muestran ficheros .pdf

# 4. Construir y arrancar
docker compose up -d --build
```

Abre el navegador en **`http://localhost:8088`** e introduce el código de acceso (`pps2025` por defecto).

> **Primera vez:** el build del contenedor `tools` (Kali Linux) descarga ~1 GB y puede tardar 5-10 minutos. Las siguientes veces usa la caché y arranca en segundos.

---

## Variables de entorno (`.env`)

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `ACCESS_CODE` | Código que das a los alumnos para entrar | `pps2025` |
| `SECRET_KEY` | Clave HMAC para firmar sesiones (≥ 32 chars) | `changeme-set-in-production-32chars!` |
| `SESSION_TTL` | Duración de sesión en segundos | `86400` (24 h) |
| `PORT` | Puerto expuesto en el host | `8088` |

---

## Uso habitual

```bash
# Arrancar
docker compose up -d

# Parar
docker compose down

# Ver logs en tiempo real
docker compose logs -f

# Rebuild tras cambios de código
docker compose up -d --build

# Estado de los contenedores
docker compose ps
```

Los tres contenedores deben aparecer como **healthy**:

```
cursopps-backend    Up (healthy)
cursopps-tools      Up (healthy)
cursopps-frontend   Up (healthy)
```

---

## Funcionalidades

### Material del curso
- **6 módulos** con PDFs, buscador global y navegación por archivos.

### Quiz individual
- Cada módulo tiene **20 preguntas** tipo test con temporizador de 20 s.
- Puntuación: 1 000 puntos base + bonus de velocidad (hasta 500) + bonus de racha (100 × racha, máx. 5).

### Kahoot multijugador
El profesor abre el modo anfitrión, los alumnos se unen desde sus dispositivos:

1. Ir a un módulo → botón **Multijugador**
2. El sistema genera un **código de 6 dígitos** y un **QR**
3. Los alumnos van a `http://<IP-del-profesor>:8088/jugar` e introducen el código
4. El profesor pulsa **Iniciar** y controla el ritmo (revelar respuesta, siguiente pregunta)
5. Al final se muestra el ranking completo

> **Nota en localhost:** el QR apunta a `localhost` y no es escaneable desde otros dispositivos. Comparte tu IP local con los alumnos (`ip addr` → p.ej. `192.168.1.X:8088/jugar`).

### Terminal de prácticas
Terminal Kali Linux completa en el navegador (ttyd, interfaz embebida vía iframe). Sin instalar nada en el ordenador del alumno.

| Categoría | Herramientas |
|-----------|-------------|
| Escaneo de red | nmap, netcat, traceroute, whois, dnsutils |
| Web / HTTP | nikto, gobuster, dirb, wfuzz, whatweb, wafw00f |
| SQL Injection | sqlmap |
| Contraseñas | john, hydra |
| Criptografía | openssl |
| Python / SAST | python3, bandit, safety, semgrep, impacket |
| Utilidades | git, vim, nano, jq, curl, wget, tree |

---

## Estructura del proyecto

```
CursoPPS/
├── backend/                # FastAPI (Python 3.12)
│   └── app/
│       ├── main.py
│       ├── security.py
│       ├── data.py
│       └── routers/        # auth, modules, files, search, game (WebSocket Kahoot)
├── frontend/               # React 18 + Vite + TypeScript + Tailwind
│   └── src/
│       ├── pages/          # Dashboard, Módulos, Quiz, GameHost, GamePlayer, Terminal, Login
│       ├── components/     # Layout, TerminalEmulator, ModuleCard, SearchModal…
│       ├── context/        # AuthContext
│       └── data/           # quizzes.ts (120 preguntas, 20 por módulo)
├── tools/                  # Kali Linux + ttyd (terminal web)
│   ├── Dockerfile
│   ├── motd.sh
│   └── wordlists/
├── Modulo1/ … Modulo6/     # PDFs del curso (montados en el backend como read-only)
├── docker-compose.yml
└── .env.example
```

---

## Módulos del curso

| # | Título | Temas |
|---|--------|-------|
| 1 | Introducción a la Seguridad Web | OWASP Top Ten 2025, normativas, ciclo de vida |
| 2 | Vulnerabilidades de Datos de Entrada | SQLi, XSS, CSRF, RCE, XXE, LFI/RFI, SSRF |
| 3 | Autenticación y Gestión de Sesiones | Broken Auth, JWT, OAuth 2.0 |
| 4 | Protección de Datos y Control de Acceso | TLS, AES, RBAC, ABAC |
| 5 | Configuración y Monitorización | CSP, HSTS, Logging, SIEM |
| 6 | Testing de Seguridad | SAST, DAST, Dependency-Check, ZAP, Burp |

---

## Seguridad

- Cookie HttpOnly firmada con HMAC-SHA256, expiración configurable
- Rate limiting: 5 req/min en login, 60 req/min en API
- Headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Protección path traversal con `Path.relative_to()` + regex
- Contenedor `tools`: `cap_drop ALL`, `no-new-privileges`, sin DNS externo, 512 MB RAM

---

## API

Swagger en `http://localhost:8000/api/docs`

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/login` | Autenticar con código |
| `GET /api/modules` | Lista de módulos |
| `GET /api/modules/{slug}` | Detalle de módulo |
| `GET /api/files/{module}/{file}` | Servir PDF de forma segura |
| `GET /api/search?q=...` | Búsqueda |
| `WS /api/game/host` | WebSocket anfitrión Kahoot |
| `WS /api/game/play` | WebSocket jugador Kahoot |
| `GET /api/health` | Health check |

---

## Licencia

Uso educativo interno. Material del curso © José Picón.

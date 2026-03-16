"""
Autenticación simple para el curso: código de acceso + JWT en cookie.
No requiere base de datos — el código se configura via variable de entorno.
"""
import os
import time
import hmac
import hashlib
import json
from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.security import limiter, SECURITY_HEADERS

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- Config ---------------------------------------------------------------
SECRET_KEY   = os.environ.get("SECRET_KEY", "changeme-set-in-production-32chars!")
ACCESS_CODE  = os.environ.get("ACCESS_CODE", "pps2025")   # código del curso
SESSION_TTL  = int(os.environ.get("SESSION_TTL", "86400"))  # 24 h
COOKIE_NAME  = "cursopps_session"


# --- Helpers --------------------------------------------------------------
def _sign(payload: dict) -> str:
    data = json.dumps(payload, sort_keys=True)
    sig  = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
    return f"{data}||{sig}"


def _verify(token: str) -> dict | None:
    try:
        data, sig = token.rsplit("||", 1)
        expected = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(data)
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


# --- Routes ---------------------------------------------------------------
class LoginRequest(BaseModel):
    code: str


@router.post("/login")
@limiter.limit("10/minute")
async def login(body: LoginRequest, request: Request, response: Response):
    if not hmac.compare_digest(body.code.strip(), ACCESS_CODE):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Código incorrecto")

    payload = {"sub": "student", "exp": int(time.time()) + SESSION_TTL}
    token   = _sign(payload)

    resp = JSONResponse(content={"ok": True}, headers=SECURITY_HEADERS)
    resp.set_cookie(
        key=COOKIE_NAME, value=token,
        httponly=True, samesite="lax",
        max_age=SESSION_TTL, path="/",
        secure=False,   # True en producción con HTTPS
    )
    return resp


@router.post("/logout")
async def logout():
    resp = JSONResponse(content={"ok": True}, headers=SECURITY_HEADERS)
    resp.delete_cookie(COOKIE_NAME, path="/")
    return resp


@router.get("/me")
async def me(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    payload = _verify(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión expirada")
    return JSONResponse(content={"authenticated": True}, headers=SECURITY_HEADERS)

"""Registro de eventos de seguridad en formato JSON (una línea por evento).

Este formato es el contrato con el SOC: Wazuh lee este fichero en IC y
HE lo usa para comprobar qué ha dejado rastro de sus pruebas. Si cambias
los nombres de los campos, las reglas de IC dejan de funcionar.

Campos fijos de cada línea:
    ts       fecha y hora con zona horaria (ISO 8601)
    app      siempre "miweb"
    evento   qué ha pasado (login_ok, login_fallido, acceso_denegado...)
    usuario  nombre de usuario, o "-" si no hay sesión
    ip       IP del cliente (la que llega desde nginx)
    metodo   GET, POST...
    ruta     ruta pedida
    estado   código HTTP que se devuelve
    detalle  texto libre corto
"""
import json
import logging
from datetime import datetime, timezone

from flask import g, request

_log = logging.getLogger("miweb.seguridad")


class FormatoJSON(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps(record.msg, ensure_ascii=False)


def configurar(ruta_fichero) -> None:
    """Prepara el fichero de registro. Se llama una vez al crear la app."""
    ruta_fichero.parent.mkdir(parents=True, exist_ok=True)
    _log.handlers.clear()
    manejador = logging.FileHandler(ruta_fichero, encoding="utf-8")
    manejador.setFormatter(FormatoJSON())
    _log.addHandler(manejador)
    _log.setLevel(logging.INFO)
    _log.propagate = False


def evento(nombre: str, estado: int = 200, usuario: str | None = None,
           detalle: str = "") -> None:
    """Escribe un evento de seguridad con los campos del contrato."""
    if usuario is None:
        usuario = g.get("usuario_nombre") or "-"
    _log.info({
        "ts": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "app": "miweb",
        "evento": nombre,
        "usuario": usuario,
        "ip": request.remote_addr or "-",
        "metodo": request.method,
        "ruta": request.path,
        "estado": estado,
        "detalle": detalle[:300],
    })

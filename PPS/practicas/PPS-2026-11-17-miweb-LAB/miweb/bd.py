"""Acceso a la base de datos SQLite."""
import sqlite3
from pathlib import Path

from flask import current_app, g
from werkzeug.security import generate_password_hash

ESQUEMA = """
CREATE TABLE IF NOT EXISTS usuarios (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre  TEXT UNIQUE NOT NULL,
    hash    TEXT NOT NULL,
    rol     TEXT NOT NULL DEFAULT 'usuario'
);
CREATE TABLE IF NOT EXISTS reservas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
    aula        TEXT NOT NULL,
    fecha       TEXT NOT NULL,
    franja      TEXT NOT NULL,
    motivo      TEXT NOT NULL
);
"""

# Datos de ejemplo: todos inventados.
EJEMPLO = [
    ("lucia", "Lucia.2026", [("Aula 1", "2026-11-23", "08:00-10:00", "Examen de redes")]),
    ("marcos", "Marcos.2026", [("Aula 2", "2026-11-24", "10:00-12:00",
                                "Práctica de Wazuh. Contraseña wifi del aula: Cheste-Lab-26")]),
]


def conexion() -> sqlite3.Connection:
    if "bd" not in g:
        Path(current_app.config["BD"]).parent.mkdir(parents=True, exist_ok=True)
        g.bd = sqlite3.connect(current_app.config["BD"])
        g.bd.row_factory = sqlite3.Row
    return g.bd


def cerrar(_exc=None) -> None:
    bd = g.pop("bd", None)
    if bd is not None:
        bd.close()


def iniciar(admin_clave: str) -> None:
    """Crea las tablas y, si la base de datos está vacía, los datos de ejemplo."""
    bd = conexion()
    bd.executescript(ESQUEMA)
    if bd.execute("SELECT COUNT(*) FROM usuarios").fetchone()[0] == 0:
        bd.execute("INSERT INTO usuarios (nombre, hash, rol) VALUES (?, ?, 'admin')",
                   ("admin", generate_password_hash(admin_clave)))
        for nombre, clave, reservas in EJEMPLO:
            cur = bd.execute("INSERT INTO usuarios (nombre, hash) VALUES (?, ?)",
                             (nombre, generate_password_hash(clave)))
            for aula, fecha, franja, motivo in reservas:
                bd.execute("INSERT INTO reservas (usuario_id, aula, fecha, franja, motivo) "
                           "VALUES (?, ?, ?, ?, ?)",
                           (cur.lastrowid, aula, fecha, franja, motivo))
    bd.commit()

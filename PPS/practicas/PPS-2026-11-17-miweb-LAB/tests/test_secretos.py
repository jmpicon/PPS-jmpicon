"""Pruebas de la práctica del 17/11. Fallan con la web tal y como te la doy.

Cuando hayas hecho los apartados de secretos, configuración y registro,
tienen que pasar todas.
"""
import importlib

import pytest

from conftest import entrar


def recargar_config():
    import miweb.config
    return importlib.reload(miweb.config)


def test_la_clave_de_sesion_sale_del_entorno(monkeypatch):
    monkeypatch.setenv("MIWEB_SECRET_KEY", "una-clave-de-prueba-larga-y-distinta")
    assert recargar_config().SECRET_KEY == "una-clave-de-prueba-larga-y-distinta"


def test_la_clave_de_admin_sale_del_entorno(monkeypatch):
    monkeypatch.setenv("MIWEB_ADMIN_CLAVE", "Otra-Clave-De-Admin-99")
    assert recargar_config().ADMIN_CLAVE == "Otra-Clave-De-Admin-99"


def test_sin_clave_de_sesion_no_arranca(monkeypatch, tmp_path):
    monkeypatch.delenv("MIWEB_SECRET_KEY", raising=False)
    monkeypatch.setenv("MIWEB_ADMIN_CLAVE", "Admin-de-pruebas-2026")
    recargar_config()
    import miweb
    importlib.reload(miweb)
    with pytest.raises(RuntimeError):
        miweb.crear_app(BD=str(tmp_path / "x.db"), REGISTRO_SEGURIDAD=tmp_path / "x.log")


def test_depuracion_apagada_por_defecto(monkeypatch):
    monkeypatch.delenv("MIWEB_DEBUG", raising=False)
    assert recargar_config().DEBUG is False


def test_depuracion_se_puede_encender(monkeypatch):
    monkeypatch.setenv("MIWEB_DEBUG", "1")
    assert recargar_config().DEBUG is True


def test_no_quedan_secretos_en_el_codigo():
    from pathlib import Path
    codigo = (Path(__file__).parent.parent / "miweb" / "config.py").read_text(encoding="utf-8")
    assert "reservas-2026-cambiar" not in codigo
    assert "Admin2026!" not in codigo


def test_el_registro_no_guarda_contrasenas(cliente, registro):
    entrar(cliente, "lucia", "Contraseña-Secreta-123")
    assert "Contraseña-Secreta-123" not in registro()


def test_el_registro_sigue_apuntando_el_fallo(cliente, registro):
    entrar(cliente, "lucia", "Contraseña-Secreta-123")
    assert '"evento": "login_fallido"' in registro()

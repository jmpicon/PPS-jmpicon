import importlib

import pytest

ENTORNO = {
    "MIWEB_SECRET_KEY": "clave-solo-para-las-pruebas-0123456789",
    "MIWEB_ADMIN_CLAVE": "Admin-de-pruebas-2026",
}


@pytest.fixture
def app(tmp_path, monkeypatch):
    for nombre, valor in ENTORNO.items():
        monkeypatch.setenv(nombre, valor)
    monkeypatch.delenv("MIWEB_DEBUG", raising=False)
    import miweb.config
    importlib.reload(miweb.config)
    import miweb
    importlib.reload(miweb)
    app = miweb.crear_app(
        TESTING=True,
        BD=str(tmp_path / "pruebas.db"),
        REGISTRO_SEGURIDAD=tmp_path / "seguridad.log",
    )
    yield app


@pytest.fixture
def cliente(app):
    return app.test_client()


@pytest.fixture
def registro(app):
    """Devuelve una función que lee el registro de seguridad como texto."""
    return lambda: app.config["REGISTRO_SEGURIDAD"].read_text(encoding="utf-8")


def entrar(cliente, nombre, clave):
    return cliente.post("/login", data={"nombre": nombre, "clave": clave})

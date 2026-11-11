"""Pruebas de que la web hace lo que tiene que hacer. Tienen que pasar siempre."""
import json

from conftest import entrar


def test_portada(cliente):
    assert cliente.get("/").status_code == 200


def test_salud(cliente):
    assert cliente.get("/salud").get_json() == {"estado": "ok"}


def test_login_correcto(cliente):
    r = entrar(cliente, "lucia", "Lucia.2026")
    assert r.status_code == 302
    assert cliente.get("/reservas").status_code == 200


def test_login_incorrecto(cliente):
    assert entrar(cliente, "lucia", "otra").status_code == 401


def test_sin_sesion_redirige_al_login(cliente):
    r = cliente.get("/reservas")
    assert r.status_code == 302
    assert "/login" in r.headers["Location"]


def test_registro_y_reserva(cliente):
    cliente.post("/registro", data={"nombre": "nuevo", "clave": "Nuevo.2026"})
    entrar(cliente, "nuevo", "Nuevo.2026")
    r = cliente.post("/reservas/nueva", data={"aula": "Aula 1", "fecha": "2026-12-01",
                                              "franja": "08:00-10:00", "motivo": "Repaso"})
    assert r.status_code == 302
    assert b"Repaso" in cliente.get(r.headers["Location"]).data


def test_admin_solo_para_admin(cliente):
    entrar(cliente, "lucia", "Lucia.2026")
    assert cliente.get("/admin").status_code == 403


def test_registro_json_con_los_campos_del_contrato(cliente, registro):
    entrar(cliente, "lucia", "nada")
    linea = json.loads(registro().splitlines()[-1])
    for campo in ("ts", "app", "evento", "usuario", "ip", "metodo", "ruta", "estado", "detalle"):
        assert campo in linea
    assert linea["app"] == "miweb"
    assert linea["evento"] == "login_fallido"
    assert linea["estado"] == 401


def test_ip_real_desde_nginx(cliente, registro):
    cliente.post("/login", data={"nombre": "lucia", "clave": "x"},
                 headers={"X-Forwarded-For": "192.168.56.101"})
    assert json.loads(registro().splitlines()[-1])["ip"] == "192.168.56.101"

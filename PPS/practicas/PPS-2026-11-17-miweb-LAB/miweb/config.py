"""Configuración de la aplicación.

Así es como la dejó el compañero que empezó el proyecto. Funciona, pero
mezcla configuración y secretos dentro del código. En la práctica del 17/11
lo arreglas.
"""
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# Clave con la que Flask firma la cookie de sesión.
SECRET_KEY = "reservas-2026-cambiar"

# Contraseña del usuario administrador que se crea al iniciar la base de datos.
ADMIN_CLAVE = "Admin2026!"

# Modo depuración: muestra los errores con todo detalle en el navegador.
DEBUG = True

# Fichero de la base de datos SQLite.
BD = RAIZ / "datos" / "miweb.db"

# Registro de seguridad: una línea JSON por evento.
REGISTRO_SEGURIDAD = RAIZ / "registros" / "seguridad.log"

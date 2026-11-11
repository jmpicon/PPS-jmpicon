"""Punto de entrada para gunicorn:  gunicorn wsgi:app"""
from miweb import crear_app

app = crear_app()

#!/bin/sh
# Instala miweb como servicio con gunicorn y nginx delante.
# Se lanza desde la carpeta del proyecto, con tu usuario (pedirá sudo):
#   sh despliegue/instalar-servicio.sh
set -eu
CARPETA=$(pwd)
USUARIO=$(id -un)
ENV_FICHERO=$HOME/.config/miweb/miweb.env

[ -f wsgi.py ] || { echo "ERROR: lánzalo desde la carpeta del proyecto (donde está wsgi.py)"; exit 1; }
[ -x .venv/bin/gunicorn ] || { echo "ERROR: falta gunicorn en .venv. Haz: . .venv/bin/activate && pip install -r requirements.txt"; exit 1; }
[ -f "$ENV_FICHERO" ] || { echo "ERROR: falta $ENV_FICHERO (apartado de secretos de la práctica)"; exit 1; }
[ "$(stat -c %a "$ENV_FICHERO")" = 600 ] || { echo "ERROR: $ENV_FICHERO debe tener permisos 600: chmod 600 $ENV_FICHERO"; exit 1; }

echo "Carpeta de registro /var/log/miweb (propiedad de $USUARIO)"
sudo install -d -o "$USUARIO" -g "$USUARIO" -m 750 /var/log/miweb

echo "Servicio systemd"
sed -e "s|USUARIO|$USUARIO|g" -e "s|CARPETA|$CARPETA|g" despliegue/miweb.service \
    | sudo tee /etc/systemd/system/miweb.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable --now miweb
sudo systemctl restart miweb

echo "nginx"
command -v nginx >/dev/null || sudo apt-get install -y nginx
sudo cp despliegue/nginx-miweb.conf /etc/nginx/sites-available/miweb
sudo ln -sf /etc/nginx/sites-available/miweb /etc/nginx/sites-enabled/miweb
sudo nginx -t
sudo systemctl reload nginx

sleep 2
if curl -fsS http://127.0.0.1:8080/salud; then
    echo
    echo "OK: miweb responde en http://127.0.0.1:8080/"
else
    echo "ERROR: no responde. Mira: sudo journalctl -u miweb -n 30 --no-pager"
    exit 1
fi

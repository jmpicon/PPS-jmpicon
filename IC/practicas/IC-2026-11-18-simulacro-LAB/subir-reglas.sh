#!/bin/sh
# Copia miweb_rules.xml a TU manager de Wazuh y comprueba que se carga.
# No toca tu local_rules.xml de la práctica del 11/11: van en ficheros distintos.
# Uso, desde la carpeta del laboratorio:
#   ./subir-reglas.sh                      (Wazuh con docker compose en ~/wazuh-docker/single-node)
#   WAZUH_DIR=/otra/ruta ./subir-reglas.sh (si tu docker compose está en otra carpeta)
#   CONTENEDOR=ic-logtest ./subir-reglas.sh (si usas un manager suelto, plan B)
#   ./subir-reglas.sh quitar               (vuelve atrás: borra miweb_rules.xml del manager)
set -eu
LAB=$(cd "$(dirname "$0")" && pwd)
WAZUH_DIR=${WAZUH_DIR:-$HOME/wazuh-docker/single-node}
REG=/var/ossec/etc/rules/miweb_rules.xml

if [ -n "${CONTENEDOR:-}" ]; then
    copiar() { docker cp "$1" "$CONTENEDOR:$2"; }
    ejecutar() { docker exec "$CONTENEDOR" "$@"; }
else
    cd "$WAZUH_DIR"
    copiar() { docker compose cp "$1" "wazuh.manager:$2"; }
    ejecutar() { docker compose exec -T wazuh.manager "$@"; }
fi

if [ "${1:-}" = quitar ]; then
    ejecutar rm -f "$REG"
    ejecutar /var/ossec/bin/wazuh-analysisd -t
    echo "OK: miweb_rules.xml quitado. Reinicia el manager para que deje de usarlo."
    exit 0
fi

# Si ya había un miweb_rules.xml en el manager, guarda una copia la primera vez.
if [ ! -s "$LAB/ANTERIOR-miweb_rules.xml" ] && ejecutar test -s "$REG"; then
    ejecutar cat "$REG" > "$LAB/ANTERIOR-miweb_rules.xml.tmp"
    mv "$LAB/ANTERIOR-miweb_rules.xml.tmp" "$LAB/ANTERIOR-miweb_rules.xml"
    echo "Copia del miweb_rules.xml que ya tenías en $LAB/ANTERIOR-miweb_rules.xml"
fi

copiar "$LAB/miweb_rules.xml" "$REG"
ejecutar chown wazuh:wazuh "$REG"
ejecutar chmod 660 "$REG"

if ejecutar /var/ossec/bin/wazuh-analysisd -t; then
    echo "OK: el manager acepta miweb_rules.xml. Ya puedes probarlo con wazuh-logtest."
else
    echo "ERROR: el manager no acepta el fichero. Lee el mensaje de arriba (fichero y línea)."
    echo "El fichero con error ya está dentro del manager: NO lo reinicies."
    echo "Corrígelo y vuelve a subirlo, o quítalo con: ./subir-reglas.sh quitar"
    exit 1
fi

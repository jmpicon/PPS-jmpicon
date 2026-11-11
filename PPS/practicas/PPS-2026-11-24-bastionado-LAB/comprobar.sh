#!/usr/bin/env bash
# Comprueba, desde tu propio equipo, el estado de seguridad de tu web.
# Lánzalo ANTES de bastionar y DESPUÉS, y compara las dos salidas.
#   bash comprobar.sh
# Usa la cuenta de ejemplo 'marcos' para tener sesión. Si cambiaste esos datos,
# edita USUARIO y CLAVE aquí abajo.
set -u
WEB=${WEB:-http://127.0.0.1:8080}
USUARIO=${USUARIO:-marcos}
CLAVE=${CLAVE:-Marcos.2026}
CK=$(mktemp)

ok()   { printf '  [OK]  %s\n' "$1"; }
mal()  { printf '  [MAL] %s\n' "$1"; }

echo "Comprobando $WEB"
curl -s -c "$CK" -o /dev/null -d "nombre=$USUARIO&clave=$CLAVE" "$WEB/login"

echo "1) Inyección SQL (una comilla en el buscador)"
code=$(curl -s -b "$CK" -o /dev/null -w "%{http_code}" "$WEB/buscar?q=%27")
[ "$code" = 500 ] && mal "la comilla rompe la consulta (HTTP 500): hay inyección" || ok "la comilla no rompe nada (HTTP $code)"

echo "2) Fuga de datos por UNION"
if curl -s -b "$CK" "$WEB/buscar?q=zz%27%20UNION%20SELECT%20id,nombre,hash,rol%20FROM%20usuarios--%20" | grep -q scrypt; then
    mal "se pueden sacar los hashes de todos los usuarios"
else
    ok "la inyección UNION ya no devuelve datos"
fi

echo "3) Acceso a reserva de otro (IDOR)"
code=$(curl -s -b "$CK" -o /dev/null -w "%{http_code}" "$WEB/reservas/1")
[ "$code" = 200 ] && mal "puedo ver la reserva 1 aunque no sea mía (HTTP 200)" || ok "la reserva ajena está protegida (HTTP $code)"

echo "4) Enumeración de usuarios (mensajes distintos)"
m_si=$(curl -s -d "nombre=$USUARIO&clave=x" "$WEB/login" | grep -oiE "no existe|incorrect[oa]s?" | head -1)
m_no=$(curl -s -d "nombre=noexisteXYZ&clave=x" "$WEB/login" | grep -oiE "no existe|incorrect[oa]s?" | head -1)
[ "$m_si" = "$m_no" ] && ok "mismo mensaje para usuario válido e inválido" || mal "el mensaje delata si el usuario existe ('$m_si' vs '$m_no')"

echo "5) Cabeceras de seguridad"
H=$(curl -s -D - -o /dev/null "$WEB/")
for cab in X-Frame-Options X-Content-Type-Options Content-Security-Policy; do
    echo "$H" | grep -iq "^$cab:" && ok "está $cab" || mal "falta $cab"
done

echo "6) Atributos de la cookie de sesión"
SC=$(curl -s -D - -o /dev/null -d "nombre=$USUARIO&clave=$CLAVE" "$WEB/login" | grep -i "^set-cookie:")
echo "$SC" | grep -iq HttpOnly && ok "la cookie es HttpOnly" || mal "la cookie no es HttpOnly"
echo "$SC" | grep -iq SameSite && ok "la cookie tiene SameSite" || mal "la cookie no tiene SameSite"

rm -f "$CK"

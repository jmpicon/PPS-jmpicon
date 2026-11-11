# Material del bastionado del 24/11

Trabajas sobre TU web, la del 17 de noviembre (la que atacaste el jueves).

- `comprobar.sh`: pasa seis comprobaciones de seguridad contra tu web y te dice
  [OK] o [MAL] en cada una. Lánzalo **antes** de arreglar nada y guarda la salida;
  luego arregla; luego vuelve a lanzarlo y compara. Esa foto del antes y el después
  es parte de la entrega.
- `nginx-bastionado.conf`: las cabeceras de seguridad para añadir a tu nginx.

Para usar `comprobar.sh` necesitas tu web arrancada y la cuenta de ejemplo `marcos`.
Si cambiaste esos datos, mira las variables del principio del script.

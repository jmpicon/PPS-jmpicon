# Material del caso SOC integral del 25/11

Hoy investigas en tu Wazuh el ataque que tú mismo lanzaste contra tu web el
jueves 19 (Hacking Ético). Trabajas con tu propio SOC y con las reglas de miweb
que cargaste el 18.

- `consultas-soc.md`: recetas de `jq` para sacar de `alerts.json` lo que vas a
  necesitar (línea temporal, agrupar por regla, filtrar por IP del atacante).
- `plantilla-caso-soc.md`: el informe del caso, de la detección al cierre.

Necesitas: tu bitácora de Hacking Ético del 19 (con las horas de cada prueba) y
tu Wazuh en marcha con las reglas `miweb` (100200-100212) del 18.

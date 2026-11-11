# Simulacro de incidente en miweb · IC 18/11/2026

Número de lista: ____    Fecha: ____________

Nombre de tu agente en Wazuh: ______________    IP de tu Kali: ______________

## 1. Punto de partida

| Comprobación | Resultado |
|---|---|
| `curl http://127.0.0.1:8080/salud` desde el Ubuntu | |
| `curl http://192.168.56.1:8080/salud` desde la Kali | |
| Agente `Active` en `agent_control -l` | |
| `wazuh-logcollector -t` sin errores | |
| El agente analiza las dos fuentes (`ossec.log`) | |
| `subir-reglas.sh` termina con `OK` | |

## 2. Las reglas de miweb

Para cada regla, explica con tus palabras qué detecta y por qué tiene ese nivel.

| Regla | Nivel | Qué detecta | ¿Por qué ese nivel? |
|---|---|---|---|
| 100201 | | | |
| 100203 | | | |
| 100204 | | | |
| 100206 | | | |
| 100207 | | | |
| 100208 | | | |
| 100209 | | | |
| 100211 | | | |

## 3. El ataque

Pega aquí el contenido de `horas-ataque.txt`.

```

```

## 4. Detección y triaje

Resumen de alertas (salida del `sort | uniq -c`):

```

```

| Alerta (regla) | Veces | ¿Verdadero positivo? | Gravedad (baja, media, alta, crítica) | Qué te dice | Qué haces |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

¿Cuál es la alerta más grave y por qué? ¿Qué cuenta ha quedado comprometida?

## 5. Contención

| Paso | Orden | Resultado |
|---|---|---|
| Línea añadida en nginx | | |
| `nginx -t` | | |
| Prueba desde la Kali | | |
| Prueba desde el Ubuntu | | |
| Qué queda en `miweb_access.log` | | |
| Qué queda en `seguridad.log` | | |

## 6. Evidencias

| Fichero | SHA-256 | Tamaño | Copiado a las (hora local) |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

Cadena de custodia:

| Fecha y hora | Quién | Qué hace con las evidencias | Dónde quedan |
|---|---|---|---|
| | | Recoge | |
| | | | |

## 7. Línea temporal

Hora local y UTC. Fuente: `seguridad.log`, `miweb_access.log`, alerta de Wazuh u `horas-ataque.txt`.

| Hora local | Hora UTC | Fuente | Qué pasa | ¿Lo sé o lo supongo? |
|---|---|---|---|---|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

## 8. Informe del incidente

**Resumen** (tres o cuatro líneas, que lo entienda alguien que no es técnico):

**Qué ha pasado**:

**Impacto** (qué datos o cuentas se han visto afectados):

**Cómo se detectó** (qué reglas y a qué hora):

**Contención aplicada**:

**Erradicación y recuperación pendientes** (qué hay que arreglar en la web y quién):

**Lecciones aprendidas** (qué falló en la detección y qué mejorarías):

## 9. Respuestas a las preguntas

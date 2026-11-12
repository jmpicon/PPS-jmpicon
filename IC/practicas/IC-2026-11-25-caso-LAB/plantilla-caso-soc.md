# Caso SOC integral — IC 25/11/2026

Analista (número de alumno): ______   Fecha: ______   Hora de análisis: ______

## 1. Resumen ejecutivo (3-4 líneas, al final)

Qué pasó, cuándo, qué se vio comprometido y en qué estado queda. Se escribe el último.

## 2. Alcance y fuentes

- Activo afectado: mi web `miweb`.
- Fuentes: registro de la aplicación (`seguridad.log`) y de nginx, vía mi agente Wazuh.
- Periodo analizado: del ____ al ____ (horas de mi bitácora del 19).

## 3. Línea temporal (de la detección a los hechos)

Junta lo que vio tu SOC con las horas de tu bitácora de Hacking Ético. Marca la
hora en UTC y en hora local.

| Hora (local) | Hora (UTC) | Regla / fuente | Qué pasó | Fase del ataque |
|--------------|-----------|----------------|----------|-----------------|
|  |  |  |  | reconocimiento |
|  |  |  |  | fuerza bruta |
|  |  |  |  | acceso |
|  |  |  |  | inyección SQL |
|  |  |  |  | acceso a datos ajenos |

## 4. Qué detectó el SOC y qué no

| Prueba que hice el 19 | ¿Generó alerta? regla | Si no, por qué |
|-----------------------|-----------------------|----------------|
| enumeración de rutas (ffuf) |  |  |
| enumeración de usuarios |  |  |
| fuerza bruta |  |  |
| inyección SQL |  |  |
| IDOR |  |  |
| XSS |  |  |

## 5. Impacto

¿Qué se vio comprometido? ¿Qué cuenta, qué datos? Apóyate en las alertas de nivel alto.

## 6. Contención, erradicación y recuperación

- Contención aplicada (la del 18): ______
- Erradicación: el bastionado del 24 (lista qué fallo cierra cada arreglo).
- ¿Qué ataques de los del 19 habría parado ese bastionado y cuáles habrían pasado igual?

## 7. Lecciones aprendidas

Dos o tres mejoras concretas para tu SOC o tu web, con lo aprendido.

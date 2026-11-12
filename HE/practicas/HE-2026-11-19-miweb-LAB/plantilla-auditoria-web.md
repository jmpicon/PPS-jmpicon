# Auditoría de mi web (miweb) — HE 19/11/2026

## Autorización (la firmo yo)

Yo, número de alumno ______, autorizo y me autorizo a realizar pruebas de
seguridad ÚNICAMENTE contra la aplicación `miweb` que corre en mi propio equipo,
en `http://192.168.56.1:8080/`, el 19/11/2026 en horario de clase. No pruebo
ninguna otra IP, puerto, equipo de compañero ni servicio del centro.

Firma: __________________    Fecha y hora de inicio: __________

## Bitácora (apunta la HORA de cada prueba — la usarás en IC el 25)

| Hora | Fase | Comando / acción | Resultado breve |
|------|------|------------------|-----------------|
|  | reconocimiento |  |  |
|  | enum. contenido |  |  |
|  | enum. usuarios |  |  |
|  | fuerza bruta |  |  |
|  | inyección SQL |  |  |
|  | IDOR |  |  |
|  | XSS |  |  |

## Hallazgos

| Id | Tipo (OWASP) | Dónde | Cómo lo confirmé | Vector CVSS 3.1 | Nota | Sev. |
|----|--------------|-------|------------------|-----------------|------|------|
| H-01 |  |  |  |  |  |  |
| H-02 |  |  |  |  |  |  |
| H-03 |  |  |  |  |  |  |
| H-04 |  |  |  |  |  |  |
| H-05 |  |  |  |  |  |  |

## Rastro que he dejado (mira tu propio registro al final)

¿Qué eventos han quedado en `/var/log/miweb/seguridad.log` y en el log de nginx
por culpa de tus pruebas? Apunta dos o tres que te hayan llamado la atención:

- 
- 

## Antes de entregar

- [ ] Todas las pruebas de la bitácora son contra 192.168.56.1:8080 (mi equipo).
- [ ] Cada hallazgo está confirmado con una prueba mía, no solo con lo que dice la herramienta.
- [ ] He puesto la hora de cada prueba (la necesito para cuadrar con Wazuh el día 25).

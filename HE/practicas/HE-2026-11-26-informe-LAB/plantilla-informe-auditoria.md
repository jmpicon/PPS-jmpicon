# Informe de auditoría de seguridad — miweb

Auditor (número de alumno): ______   Fecha del informe: ______

## 1. Resumen ejecutivo

Tres o cuatro líneas para quien decide, sin tecnicismos: qué se auditó, cuántos
hallazgos hubo y de qué gravedad, y en qué estado queda la web tras las correcciones.

## 2. Alcance y metodología

- Objetivo: aplicación `miweb` en `http://192.168.56.1:8080/` (mi equipo).
- Fechas: pruebas iniciales 19/11; reverificación tras correcciones 26/11.
- Metodología: reconocimiento, enumeración, pruebas de autenticación, autorización,
  inyección y XSS (OWASP WSTG). Herramientas: nmap, whatweb, ffuf, sqlmap, navegador.
- Alcance expreso: solo mi web. Nada de otros equipos ni servicios.

## 3. Resumen de hallazgos

| Id | Hallazgo | OWASP | CVSS (nota) | Estado 19/11 | Estado 26/11 |
|----|----------|-------|-------------|--------------|--------------|
| H-01 | Inyección SQL en /buscar |  |  | Confirmado | ¿Corregido? |
| H-02 | Acceso a reservas ajenas (IDOR) |  |  | Confirmado |  |
| H-03 | Enumeración de usuarios |  |  | Confirmado |  |
| H-04 | Sin límite de intentos |  |  | Confirmado |  |
| H-05 | XSS almacenado |  |  | Confirmado |  |
| H-06 | Cabeceras/cookies sin asegurar |  |  | Confirmado |  |

## 4. Detalle de cada hallazgo

Para cada uno: descripción, prueba que lo confirmó (comando y evidencia), impacto,
recomendación y resultado de la reverificación del 26.

### H-01 ...

## 5. Reverificación (26/11)

Para cada hallazgo, repite la prueba exacta del 19 sobre la web bastionada y anota
el resultado. Rellena la última columna de la tabla del apartado 3.

| Hallazgo | Prueba repetida | Resultado ahora | ¿Corregido? |
|----------|-----------------|-----------------|-------------|
|  |  |  |  |

## 6. Conclusión

¿Está la web lista para ponerse en producción? ¿Qué quedaría pendiente? Una
recomendación final honesta.

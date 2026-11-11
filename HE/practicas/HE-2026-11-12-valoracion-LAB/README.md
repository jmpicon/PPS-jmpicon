# Material de la práctica del 12 de noviembre: valorar hallazgos

Aquí tienes lo que vas a usar hoy. Todo es tuyo y funciona sin Internet.

- `cvss31.py`: calculadora de la puntuación base CVSS 3.1. No necesita Internet
  ni instalar nada. Le das un vector y te da la nota y la severidad.
- `plantilla-valoracion.md`: donde pasas a limpio tus hallazgos de la semana
  pasada (TECNORIBERA) y los de hoy (Metasploitable), ya con su valoración.

## La calculadora, en diez segundos

```
python3 cvss31.py AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

Te responde la puntuación base (0 a 10) y la severidad (Baja, Media, Alta o
Crítica). Si la lanzas sin escribir el vector, te pregunta métrica a métrica.

Un vector CVSS es la foto de una vulnerabilidad en ocho letras: cómo se ataca
(`AV`), lo difícil que es (`AC`), si hacen falta privilegios (`PR`), si tiene que
colaborar un usuario (`UI`), si el fallo se queda en su sitio o salta a otro
componente (`S`), y cuánto afecta a la confidencialidad, la integridad y la
disponibilidad (`C`, `I`, `A`).

## Lo importante de hoy

Solo se puntúa lo que está **confirmado**. Un indicio ("la versión parece
antigua", "la herramienta dice que es vulnerable") no es un hallazgo todavía:
es una pista que hay que confirmar con una prueba. Si no la puedes confirmar,
se queda como sospecha y no lleva nota. Poner una nota a una sospecha es mentir
con cifras.

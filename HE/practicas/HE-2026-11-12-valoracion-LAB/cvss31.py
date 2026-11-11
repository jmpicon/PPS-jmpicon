#!/usr/bin/env python3
"""Calcula la puntuación base CVSS 3.1 a partir de un vector.

No usa Internet ni ninguna biblioteca de fuera: implementa la fórmula publicada
por FIRST (la organización que mantiene CVSS). Sirve para que puedas poner una
nota a un hallazgo en el aula aunque el laboratorio no tenga Internet.

Uso:
    python3 cvss31.py AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    python3 cvss31.py            (te lo pregunta métrica a métrica)

La puntuación base valora una vulnerabilidad CONFIRMADA por sus características
propias, sin mirar tu entorno. Un indicio o una sospecha no se puntúan: primero
se confirman. Lee el README del laboratorio.
"""
import sys

# Pesos de la especificación CVSS 3.1 (tabla oficial de FIRST).
PESO = {
    "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.20},
    "AC": {"L": 0.77, "H": 0.44},
    "PR": {"U": {"N": 0.85, "L": 0.62, "H": 0.27},
           "C": {"N": 0.85, "L": 0.68, "H": 0.50}},
    "UI": {"N": 0.85, "R": 0.62},
    "C": {"H": 0.56, "L": 0.22, "N": 0.00},
    "I": {"H": 0.56, "L": 0.22, "N": 0.00},
    "A": {"H": 0.56, "L": 0.22, "N": 0.00},
}
NOMBRE = {
    "AV": "Vector de ataque (N red, A adyacente, L local, P físico)",
    "AC": "Complejidad del ataque (L baja, H alta)",
    "PR": "Privilegios necesarios (N ninguno, L bajos, H altos)",
    "UI": "Interacción del usuario (N ninguna, R requerida)",
    "S":  "Alcance / Scope (U sin cambio, C cambia)",
    "C":  "Confidencialidad (H alta, L baja, N ninguna)",
    "I":  "Integridad (H alta, L baja, N ninguna)",
    "A":  "Disponibilidad (H alta, L baja, N ninguna)",
}
ORDEN = ["AV", "AC", "PR", "UI", "S", "C", "I", "A"]


def roundup(x: float) -> float:
    """Redondeo 'hacia arriba' que define CVSS 3.1 (a un decimal)."""
    entero = round(x * 100000)
    if entero % 10000 == 0:
        return entero / 100000.0
    return (entero // 10000 + 1) / 10.0


def severidad(nota: float) -> str:
    if nota == 0.0:
        return "Ninguna"
    if nota < 4.0:
        return "Baja"
    if nota < 7.0:
        return "Media"
    if nota < 9.0:
        return "Alta"
    return "Crítica"


def puntuar(vector: str) -> float:
    m = {}
    for parte in vector.strip().strip("/").split("/"):
        clave, _, valor = parte.partition(":")
        m[clave.upper()] = valor.upper()
    for req in ORDEN:
        if req not in m:
            raise ValueError(f"falta la métrica {req} ({NOMBRE[req]})")
    s = m["S"]

    iss = 1 - (1 - PESO["C"][m["C"]]) * (1 - PESO["I"][m["I"]]) * (1 - PESO["A"][m["A"]])
    if s == "U":
        impacto = 6.42 * iss
    else:
        impacto = 7.52 * (iss - 0.029) - 3.25 * (iss - 0.02) ** 15

    explotabilidad = (8.22 * PESO["AV"][m["AV"]] * PESO["AC"][m["AC"]]
                      * PESO["PR"][s][m["PR"]] * PESO["UI"][m["UI"]])

    if impacto <= 0:
        return 0.0
    if s == "U":
        return roundup(min(impacto + explotabilidad, 10))
    return roundup(min(1.08 * (impacto + explotabilidad), 10))


def preguntar() -> str:
    print("Escribe el valor de cada métrica (la letra entre paréntesis):\n")
    opciones = {"AV": "NALP", "AC": "LH", "PR": "NLH", "UI": "NR",
                "S": "UC", "C": "HLN", "I": "HLN", "A": "HLN"}
    partes = []
    for clave in ORDEN:
        valido = opciones[clave]
        while True:
            v = input(f"  {clave} — {NOMBRE[clave]}: ").strip().upper()
            if v in valido:
                partes.append(f"{clave}:{v}")
                break
            print(f"    valor no válido; esperaba una de: {', '.join(valido)}")
    return "/".join(partes)


def main() -> None:
    if len(sys.argv) > 1:
        vector = sys.argv[1]
    else:
        vector = preguntar()
    try:
        nota = puntuar(vector)
    except (ValueError, KeyError) as error:
        print(f"Vector mal escrito: {error}")
        print("Ejemplo correcto: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")
        sys.exit(1)
    print(f"\nVector CVSS:3.1/{vector.strip().strip('/')}")
    print(f"Puntuación base: {nota}  ({severidad(nota)})")


if __name__ == "__main__":
    main()

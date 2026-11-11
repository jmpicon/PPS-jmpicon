# Laboratorio IC 18/11: simulacro de incidente en tu web

Material de la práctica del 18 de noviembre. Esta semana tu Wazuh vigila tu propia web,
miweb, la que pusiste en marcha el martes en PPS. Tu Kali hace de atacante, tu Ubuntu de
servidor y tú de analista del SOC.

| Fichero | Para qué sirve |
|---|---|
| `ossec-localfile.xml` | Los dos bloques que añades al agente para que lea los registros de miweb |
| `miweb_rules.xml` | Reglas de Wazuh para el registro de seguridad de miweb (100200 a 100212) |
| `subir-reglas.sh` | Copia `miweb_rules.xml` a tu manager y comprueba que lo acepta |
| `ataque-simulado.sh` | El ataque. Se lanza **desde tu Kali** contra **tu** web |
| `plantilla-incidente.md` | Plantilla de la entrega: triaje, contención, evidencias, línea temporal e informe |

## Las dos fuentes

- `/var/log/miweb/seguridad.log`: lo que la aplicación sabe. Una línea JSON por evento,
  con usuario, IP, ruta, código y detalle. Wazuh la entiende sin decodificador propio.
- `/var/log/nginx/miweb_access.log`: lo que ve nginx de cada petición, en el formato
  `combined` de siempre. Wazuh la entiende con sus reglas de serie de servidores web.

## La red

| Equipo | Dirección | Papel |
|---|---|---|
| Tu Ubuntu | 192.168.56.1 (y 127.0.0.1) | Servidor de miweb, agente de Wazuh, manager en Docker |
| Tu Kali | 192.168.56.101 a 192.168.56.150 | Atacante |

Todo pasa dentro de tu propio ordenador. nginx responde 403 a cualquier otro equipo del aula.

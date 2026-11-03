# Laboratorio de VMs: Kali + Metasploitable (VirtualBox)

Esta guía es para cuando el objetivo no es un contenedor Docker (Juice Shop, DVWA,
TECNORIBERA), sino una **máquina virtual completa y vulnerable**: Metasploitable 2
(ver [objetivos/metasploitable.md](objetivos/metasploitable.md)), atacada desde
vuestra Kali.

Lo monta el script [`labnet-up.sh`](labnet-up.sh), que se ejecuta en el **Ubuntu**
del puesto (no dentro de la Kali). La hoja paso a paso para el alumnado está en
[Prepara tu equipo para Metasploitable](../../docs/sesiones/HE-preparar-metasploitable.md).

## 1. Cómo queda la red

| Máquina | Tarjeta 1 | Tarjeta 2 | IP en `labnet` |
|---|---|---|---|
| Kali | la que ya tenía (NAT): Internet y TECNORIBERA | red interna `labnet` | `10.10.10.50` |
| Metasploitable | red interna `labnet` | ninguna | `10.10.10.13` |

`labnet` es una **red interna** de VirtualBox (`10.10.10.0/24`): solo existe dentro
del ordenador y las máquinas conectadas a ella se ven entre sí y con nadie más.

| Modo de red | ¿Internet? | ¿Toca la red del aula? | Uso en el curso |
|---|---|---|---|
| Red interna (`intnet`) | No | No | `labnet`: Kali ↔ Metasploitable |
| NAT | Salida sí | No (solo salida) | tarjeta 1 de la Kali |
| Adaptador puente | Sí | **Sí** | nunca para Metasploitable |

La IP la da un servidor DHCP de VirtualBox atado a `labnet`, con **reserva fija por
máquina** (por MAC). No hay que configurar IP a mano en ninguna de las dos. Ese DHCP
no anuncia puerta de enlace, así que la Kali sigue saliendo a Internet por su
tarjeta 1.

Metasploitable **no tiene Internet nunca**: es de 2012, sus repositorios están
muertos y no hay nada que instalarle. No hay orden para dárselo.

## 2. Órdenes

```
./labnet-up.sh preparar <metasploitable-linux-2.0.0.zip>   # todo: importar + cablear + foto + comprobar
./labnet-up.sh importar <zip|vmdk>   # solo crear la VM metasploitable
./labnet-up.sh cablear               # red de las dos VM + DHCP con reservas
./labnet-up.sh comprobar             # aislamiento; no arranca nada
./labnet-up.sh foto                  # instantánea 'limpia' de Metasploitable
./labnet-up.sh arrancar              # comprueba y arranca Metasploitable sin ventana
./labnet-up.sh parar                 # apaga Metasploitable
./labnet-up.sh restaurar             # Metasploitable vuelve a 'limpia'
./labnet-up.sh estado                # estado y tarjetas de las dos VM
```

- La Kali se busca sola (una VM con "kali" en el nombre). Si hay varias o se llama
  de otra forma: `KALI_VM="Nombre exacto" ./labnet-up.sh ...`.
- `comprobar` falla si Metasploitable tiene cualquier tarjeta que no sea `labnet`,
  si la Kali no tiene tarjeta en `labnet` o si falta el DHCP. Si la Kali tiene una
  tarjeta en adaptador puente solo avisa (la Kali no es la máquina vulnerable).
- `importar` comprueba el SHA-256 del ZIP oficial
  (`2ae8788e95273eee87bd379a250d86ec52f286fa7fe84773a3a8f6524085a1ff`, el que publica
  SourceForge) antes de descomprimir.
- Todas las órdenes son repetibles: lo que ya está hecho no se rehace.
- No se lanza con `sudo`: las VM son del usuario.

## 3. En el aula sin Internet

El ZIP pesa 825 MB. Si la red del centro no deja bajarlo, el profesor lo sirve
desde su equipo por la red del aula o lo reparte en USB; el script
comprueba la huella igual venga de donde venga.

## 4. Errores frecuentes

- **`está encendida` / `está suspendida`**: hay que apagar la VM del todo, no
  guardar el estado, antes de cambiarle la red.
- **`eth1` sin IP en la Kali**: el DHCP de `labnet` solo responde mientras hay una
  VM encendida en esa red. Arranca Metasploitable y reconecta con
  `sudo nmcli device connect eth1`.
- **El `ping` a `10.10.10.13` no responde**: Metasploitable aún arranca (tarda
  un minuto) o está apagada; mira `./labnet-up.sh estado`.
- **Mac con Apple Silicon**: VirtualBox solo ejecuta invitados ARM y Metasploitable
  es x86 (32 bits); no arranca. Los puestos del aula son x86 y no tienen este
  problema.

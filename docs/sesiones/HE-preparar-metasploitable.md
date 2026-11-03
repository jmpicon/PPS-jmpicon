# Prepara tu equipo para Metasploitable

<!-- pdf: Nombre y apellidos: ____________________________________________________ -->

**HE · tarea de preparación · unos 45 minutos · trabajo individual · tenla hecha antes del jueves 12 de noviembre**

<!-- solo-web -->
[Descargar esta hoja en PDF](../../HE/practicas/HE-preparar-metasploitable.pdf) · [Versión Word](../../HE/practicas/HE-preparar-metasploitable.docx) · [Script labnet-up.sh](../../comun/entornos/labnet-up.sh)
<!-- /solo-web -->

Dentro de poco dejamos de mirar TECNORIBERA desde fuera y pasamos a la explotación. Para eso necesitáis una víctima que sea vuestra y que podáis romper sin miedo: Metasploitable 2, una máquina Linux llena de servicios vulnerables a propósito que publicó Rapid7, los autores de Metasploit, justo para practicar.

Hoy no se ataca nada. Hoy solo dejáis el laboratorio montado y comprobáis que vuestra Kali llega a la víctima. Así el día de la práctica empezamos directamente a trabajar y no perdemos la primera hora instalando.

## 1. Cómo queda el laboratorio

Vais a tener dos máquinas virtuales en VirtualBox, en el Ubuntu de vuestro puesto:

1. **Kali**, la que ya tenéis. Su tarjeta de red 1 se queda como está (NAT), así que sigue teniendo Internet y sigue llegando a TECNORIBERA. Le añadimos una tarjeta 2 conectada a una red interna de VirtualBox que se llama `labnet`. Por esa tarjeta tendrá la IP `10.10.10.50`.
2. **Metasploitable**, nueva. Tiene una sola tarjeta, conectada a `labnet`, con la IP `10.10.10.13`. No tiene Internet ni ve la red del aula, y no tiene que tenerlos nunca.

Una red interna de VirtualBox solo existe dentro de vuestro ordenador: las máquinas que están en ella se ven entre ellas y con nadie más. Por eso Metasploitable puede ser tan vulnerable como quiera sin poner en peligro a nadie. Si alguna vez la conectáis en modo adaptador puente o NAT, la estáis sacando de esa burbuja, y eso no se hace.

Todo esto lo hace un script que he preparado, `labnet-up.sh`. Se ejecuta en el **Ubuntu**, no dentro de la Kali.

## 2. Comprueba que tienes sitio y lo necesario (5 minutos)

Abre una terminal en el Ubuntu de tu puesto:

```
VBoxManage --version
VBoxManage list vms
df -h ~
```

La primera orden te dice la versión de VirtualBox; si dice que no encuentra la orden, avísame. La segunda lista tus máquinas virtuales: tiene que salir tu Kali. Apunta el nombre exacto tal como sale entre comillas. La tercera te dice el espacio libre en tu carpeta personal: necesitas al menos **4 GB** libres (el ZIP ocupa 0,9 GB y el disco de Metasploitable descomprimido 1,9 GB).

## 3. Consigue el ZIP de Metasploitable y el script (15 minutos)

El ZIP oficial está en SourceForge. Descárgalo en tu carpeta de descargas:

```
cd ~/Descargas
curl -L -o metasploitable-linux-2.0.0.zip \
  "https://sourceforge.net/projects/metasploitable/files/Metasploitable2/metasploitable-linux-2.0.0.zip/download"
```

Si en el aula la descarga no va o va muy lenta, no insistas: pídemelo y te lo paso yo por la red del aula o en un USB. Es el mismo fichero.

Ahora el script. Lo tienes en la web del curso, en el apartado de entornos, o directamente así:

```
curl -O https://raw.githubusercontent.com/jmpicon/curso-ciberseguridad-2026-27/main/comun/entornos/labnet-up.sh
chmod +x labnet-up.sh
```

La segunda orden le da permiso de ejecución. Comprueba que los dos ficheros están ahí con `ls -lh`. El ZIP tiene que ocupar unos 825 MB. Si ocupa mucho menos, la descarga se ha cortado: bórralo y vuelve a bajarlo.

## 4. Prepara el laboratorio (15 minutos)

Antes de nada, **apaga tu Kali del todo**. No vale cerrar la ventana guardando el estado: tiene que quedar "Apagada" en VirtualBox. El script necesita la máquina apagada para añadirle la tarjeta de red.

Después, desde `~/Descargas`:

```
./labnet-up.sh preparar ~/Descargas/metasploitable-linux-2.0.0.zip
```

El script hace cinco cosas, y te va diciendo cada una en verde:

1. Comprueba la huella SHA-256 del ZIP. Si no coincide con la del fichero oficial, para y te lo dice: el ZIP está incompleto o no es el bueno.
2. Descomprime el disco y crea la máquina `metasploitable` con 512 MB de memoria y su única tarjeta en `labnet`.
3. Añade a tu Kali la tarjeta en `labnet` sin tocar la tarjeta 1.
4. Crea en VirtualBox un pequeño servidor DHCP para `labnet` que siempre da la `10.10.10.13` a Metasploitable y la `10.10.10.50` a tu Kali.
5. Hace una instantánea llamada `limpia` de Metasploitable recién instalada, para poder volver a ella cuando la rompas.

Al final tiene que decir `Todo bien` y `Listo`. Si tienes varias máquinas con "kali" en el nombre, el script te pedirá que le digas cuál. Se lo indicas así, con el nombre que apuntaste en el apartado 2:

```
KALI_VM="Kali Linux" ./labnet-up.sh preparar ~/Descargas/metasploitable-linux-2.0.0.zip
```

Si lo ejecutas dos veces no pasa nada: lo que ya está hecho no lo repite.

## 5. Comprueba que llegas (10 minutos)

Arranca Metasploitable sin ventana:

```
./labnet-up.sh arrancar
./labnet-up.sh estado
```

En `estado` tiene que salir tu Kali con `nic1=nat nic2=intnet:labnet` y Metasploitable solo con `nic1=intnet:labnet`. Espera un minuto a que Metasploitable termine de arrancar y enciende tu Kali como siempre. Dentro de la Kali:

```
ip -br a
ping -c 3 10.10.10.13
nc -zv -w 3 10.10.10.13 22
```

En `ip -br a` tienes que ver dos interfaces con IP: `eth0` con la de siempre y `eth1` con la `10.10.10.50`. El `ping` tiene que recibir respuesta y `nc` tiene que decir que el puerto 22 está abierto. Con eso sabes que tu Kali llega a Metasploitable por `labnet`.

Comprueba también que no has perdido nada de lo que tenías: haz `ping -c 2 1.1.1.1` o abre una página web desde la Kali. Si antes tenías Internet en la Kali, lo tienes que seguir teniendo.

Nada de escanear ni de atacar todavía. Eso lo hacemos juntos en clase, con el alcance por escrito.

Para terminar, desde el Ubuntu:

```
./labnet-up.sh parar
```

## 6. Si algo no funciona

`no lo lances con sudo`: el script se ejecuta con tu usuario normal, porque las máquinas virtuales son tuyas y no de root.

`está encendida` o `está suspendida`: tu Kali no está apagada del todo. Arráncala, apágala desde dentro (o con Máquina, Apagar en VirtualBox) y repite.

`el ZIP no es el oficial o está incompleto`: bórralo y vuelve a descargarlo, o pídemelo en USB.

`unzip: command not found`: instálalo con `sudo apt install unzip` y repite.

`no encuentro ninguna VM con 'kali' en el nombre`: tu Kali se llama de otra forma. Usa `KALI_VM="nombre exacto"` delante de la orden, como en el apartado 4.

En la Kali, `eth1` no tiene IP: espera unos segundos y mira otra vez. Si sigue sin IP, desconecta y conecta "Wired connection 2" desde el icono de red de la Kali, o ejecuta `sudo nmcli device connect eth1`. Comprueba también que Metasploitable está encendida: el DHCP de `labnet` solo funciona mientras hay alguna máquina encendida en esa red.

El `ping` no responde pero `eth1` tiene la `10.10.10.50`: Metasploitable todavía está arrancando o está apagada. Mira `./labnet-up.sh estado` y espera un minuto.

Si has roto Metasploitable o has cambiado algo y no sabes volver atrás: `./labnet-up.sh restaurar` la deja como recién instalada.

## 7. Normas del laboratorio

1. Metasploitable vive solo en `labnet`. Nunca adaptador puente, nunca NAT, nunca en otra red. Si `./labnet-up.sh comprobar` dice que algo no está bien, no la arranques hasta arreglarlo con `./labnet-up.sh cablear`.
2. Solo atacas a tu Metasploitable, en tu equipo y en las prácticas que digamos. Nada de buscar las de tus compañeros.
3. Usuario y contraseña de Metasploitable: `msfadmin` / `msfadmin`. Son públicos y forman parte del ejercicio. No reutilices nada de esto en ningún sitio.

## 8. Qué tienes que traer hecho

Un fichero `NN-preparacion-metasploitable.txt` (NN es tu número de lista) con la salida de estas órdenes, pegada tal cual:

1. `./labnet-up.sh estado`, ejecutada en el Ubuntu con Metasploitable encendida.
2. `ip -br a`, `ping -c 3 10.10.10.13` y `nc -zv -w 3 10.10.10.13 22`, ejecutadas en la Kali.

Y dos líneas al final explicando con tus palabras por qué Metasploitable no puede tener Internet y tu Kali sí.

## Referencias

- Metasploitable 2, documentación de Rapid7: https://docs.rapid7.com/metasploit/metasploitable-2/
- Manual de VirtualBox (capítulo de redes): https://www.virtualbox.org/manual/

<!-- solo-web -->
[Volver a las sesiones](README.md) · [Volver a Hacking Ético](../../HE/README.md)
<!-- /solo-web -->

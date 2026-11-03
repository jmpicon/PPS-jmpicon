# Preparar el puesto de trabajo · Curso 2026–2027

Vamos a preparar un entorno que puedas repetir y recuperar. Primero comprobaremos el equipo, después el material y, por último, la práctica concreta. Cada comprobación deja una evidencia: que un programa esté instalado no demuestra que el ejercicio funcione.

## 1. Qué tienes y dónde se hace cada cosa

| Elemento | Para qué sirve | Dónde está |
|---|---|---|
| Ubuntu 26.04 LTS | Tu sistema principal | PC del aula |
| Python 3.14 y entornos virtuales | Prácticas de PPS: pruebas, análisis de código | Ubuntu |
| Docker Engine + Compose | Tu Wazuh y otros servicios del laboratorio | Ubuntu |
| Wazuh (manager, indexer y dashboard) | Tu SOC para las prácticas de IC | Contenedores Docker en Ubuntu |
| Agente de Wazuh | Envía los eventos de tu Ubuntu a tu Wazuh | Ubuntu |
| VirtualBox | Ejecuta la máquina virtual de Hacking Ético | Ubuntu |
| Kali Linux | Herramientas y laboratorio de HE (TECNORIBERA) | Máquina virtual |

En resumen: **PPS e IC se hacen en el Ubuntu; HE se hace en la Kali.** Cada práctica te lo recuerda al principio.

`localhost` (`127.0.0.1`) es siempre el equipo donde ejecutas la orden. El `localhost` de la Kali no es el del Ubuntu: si abres el dashboard de Wazuh en el navegador de la Kali con `https://127.0.0.1`, no lo encontrarás. Ábrelo en el navegador del Ubuntu.

Wazuh y la Kali consumen bastante memoria. Si tu equipo va justo, no los tengas a la vez a pleno rendimiento: cuando trabajes en la Kali, para Wazuh con `docker compose stop` desde su carpeta y vuelve a arrancarlo con `docker compose start` cuando lo necesites.

Antes de empezar, guarda la salida de estas órdenes en el Ubuntu:

```bash
grep PRETTY_NAME /etc/os-release
uname -m
python3 --version
free -h
df -h ~
```

Tienes que ver Ubuntu 26.04, `x86_64` y Python 3.14.

## 2. Docker en el Ubuntu

Si Docker aún no está instalado, hazlo con los paquetes de Ubuntu (necesitas Internet):

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git curl jq unzip
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Cierra la sesión y vuelve a entrar para que se aplique el grupo. Después comprueba:

```bash
docker version
docker compose version
docker info
```

Debe aparecer información del cliente y del servidor, y `docker compose` tiene que funcionar. No mezcles los paquetes `docker.io` de Ubuntu con `docker-ce` de la web de Docker: elige uno.

| Error | Qué comprobar | Cómo seguir |
|---|---|---|
| `permission denied` en `docker.sock` | `id -nG` | Cierra la sesión y vuelve a entrar; comprueba que estás en el grupo `docker` |
| `Cannot connect to the Docker daemon` | `systemctl status docker` | Arranca el servicio y repite `docker info` |
| `compose` no es un comando | `docker compose version` | Falta `docker-compose-v2` |
| `No space left on device` | `df -h` y `docker system df` | Libera espacio con cuidado: no borres las imágenes ni los volúmenes de Wazuh y no lances `docker system prune` sin mirar antes qué va a eliminar |

Pertenecer al grupo `docker` equivale a tener privilegios de administrador en el equipo. En el puesto del aula es lo que necesitamos; no lo hagas a la ligera en otros equipos.

## 3. Tu Wazuh en el Ubuntu

Cada uno tiene su propio Wazuh en su ordenador. El montaje completo, paso a paso, está en la **Práctica 0 de IC** («Monta tu Wazuh SOC paso a paso», en la web, IC, Prácticas). Aquí tienes solo lo esencial para comprobarlo o rehacerlo.

El indexer necesita este ajuste del sistema; sin él, su contenedor se reinicia una y otra vez:

```bash
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-wazuh.conf
```

Usamos la versión 4.14.8 de `wazuh-docker`, en modo `single-node`:

```bash
cd ~
git clone https://github.com/wazuh/wazuh-docker.git -b v4.14.8
cd ~/wazuh-docker/single-node
docker compose -f generate-indexer-certs.yml run --rm generator
docker compose up -d
docker compose ps
```

Tienen que aparecer `wazuh.manager`, `wazuh.indexer` y `wazuh.dashboard` en marcha. Que estén en marcha no basta: dales un par de minutos y comprueba que el dashboard carga y te deja entrar. Si alguno se reinicia una y otra vez, mira qué dice con `docker compose logs --tail=100 wazuh.indexer` (o el servicio que falle). El dashboard se abre en el navegador del Ubuntu en `https://127.0.0.1`; el aviso del certificado es normal porque es autofirmado. La contraseña inicial está en la práctica 0: cámbiala y no la pongas en capturas ni en entregas.

Todas las órdenes de Wazuh de las prácticas se lanzan desde `~/wazuh-docker/single-node`. Si lo tienes en otra carpeta, ajusta la ruta.

## 4. El agente de Wazuh en el Ubuntu

El agente está instalado en el **propio Ubuntu**, el mismo equipo donde corre Wazuh. Por eso, en tu caso, la dirección del manager es `127.0.0.1`: los contenedores publican en el Ubuntu los puertos 1514 y 1515 (TCP), por los que se conecta y se registra el agente. Si algún día pones un agente en otra máquina (por ejemplo, en la Kali), allí tendrás que usar la IP real del Ubuntu, no `127.0.0.1`.

La instalación está en la práctica 0. Para comprobar que funciona:

```bash
sudo systemctl status wazuh-agent --no-pager
sudo grep -E "<address>|<port>" /var/ossec/etc/ossec.conf
cd ~/wazuh-docker/single-node
docker compose exec wazuh.manager /var/ossec/bin/agent_control -l
```

Tu agente tiene que salir como `Active`. Si sale `Disconnected` o `Never connected`, mira las últimas líneas de su registro con `sudo tail -n 50 /var/ossec/logs/ossec.log` y el checklist de troubleshooting de Wazuh de la web.

Ubuntu 26.04 trae `rsyslog`, así que los mensajes del sistema llegan a `/var/log/syslog`. Algunas prácticas de IC escriben ahí eventos de prueba con `logger` para que tu agente los recoja.

## 5. Python para PPS

Cada práctica de PPS usa su propio entorno virtual dentro de la carpeta del proyecto. No instales nada con `sudo pip`: en Ubuntu 26.04 te dará `externally-managed-environment`, y hace bien en impedírtelo.

Con Internet:

```bash
sudo apt install -y python3-venv
cd CARPETA_DE_LA_PRACTICA
python3 -m venv .venv
. .venv/bin/activate
pip install LO_QUE_PIDA_LA_PRACTICA
```

Si `python3 -m venv` dice que `ensurepip is not available`, te falta `python3-venv`: es el `apt install` de la primera línea.

**No instales Bandit con `apt`.** El paquete de Ubuntu 26.04 (Bandit 1.7.10) no funciona con Python 3.14: se salta todos los ficheros, dice que no hay ningún aviso y termina como si todo fuera bien. Instálalo siempre con `pip` dentro del entorno virtual. Si alguna vez Bandit te dice `No issues identified` pero más abajo aparece `Files skipped` con `exception while scanning file`, ese resultado no vale.

### Sin Internet: el USB de PPS

Si en el aula no hay Internet, te paso un USB con la carpeta `PPS-offline`. Lleva `python3-venv` para Ubuntu 26.04 y los paquetes de Python que usamos este trimestre: `pytest`, `pytest-cov`, `hypothesis`, `bandit[toml]`, `flask` y `requests`. Desde la carpeta de tu práctica:

```bash
sh /media/TU_USUARIO/NOMBRE_DEL_USB/PPS-offline/instalar.sh
. .venv/bin/activate
```

El script comprueba que estás en un Ubuntu 26.04 de 64 bits con Python 3.14, instala `python3-venv` si te falta (te pedirá tu contraseña), crea `.venv` e instala todo sin conexión. Al final te muestra las versiones de `pytest` y `bandit`. Si te dice que no es tu versión de Python, probablemente estás en la Kali: las prácticas de PPS se hacen en el Ubuntu.

`pip-audit` no va en el USB: necesita Internet para consultar la base de datos de vulnerabilidades.

## 6. La Kali en VirtualBox

La Kali es para Hacking Ético. Ya la tienes importada en VirtualBox. Comprueba que sigue en buen estado:

1. Revisa en VirtualBox la memoria, las CPU y el disco asignados. Si el Ubuntu va justo de memoria, no le des a la Kali más de la mitad de la RAM del equipo.
2. Arráncala y ejecuta `uname -m`, `ip -br addr` y `df -h`. Guarda la salida.
3. Con la Kali apagada y en buen estado, crea una instantánea llamada `base-curso-validada`. Una instantánea no sustituye a la copia de tus entregas: guárdalas también fuera de la VM.

Si alguna vez tienes que volver a importarla: una `.ova` se abre con **Archivo → Importar servicio virtualizado**; la imagen oficial `.7z` se descomprime y se abre con **Máquina → Añadir** sobre el fichero `.vbox`. Más información en la [documentación oficial de Kali para VirtualBox](https://www.kali.org/docs/virtualization/import-premade-virtualbox/).

### Red de la Kali

Para las prácticas web locales, el navegador y las herramientas funcionan dentro de la propia Kali y los servicios se publican en `127.0.0.1`, sin exponerlos a la red del aula.

TECNORIBERA y las prácticas que necesitan varias máquinas usan una **red interna de VirtualBox** o la red aislada que prepare el profesor. Nunca lances pruebas contra la red del instituto ni contra equipos de compañeros. La red NAT de VirtualBox sirve para actualizar la Kali con Internet; no la conecta a la red interna del laboratorio. Usa siempre la red que indique la ficha.

Anota la IP, la máscara, la puerta de enlace y el nombre de la interfaz:

```bash
ip -br addr
ip route
```

No copies la IP de un ejemplo como si fuera la tuya. Antes de cualquier prueba activa, comprueba que el objetivo es exactamente el autorizado en la ficha.

### Objetivos web dentro de la Kali

Algunas fichas de HE arrancan aplicaciones vulnerables (Juice Shop, DVWA…) con Docker **dentro de la Kali**, siempre publicadas solo en `127.0.0.1`. Ese Docker es independiente del del Ubuntu: tiene sus propias imágenes, contenedores, redes y puertos, y sus órdenes se escriben en la terminal de la Kali. Si la Kali no lo tiene, en la preparación con Internet:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Arranca solo lo que pida la ficha y comprueba que funciona de verdad (que puedes iniciar sesión o completar la operación), no solo que responde con un 200. Para ver qué pasa: `docker compose ps` y `docker compose logs --tail=100 NOMBRE_DEL_SERVICIO`.

Las fichas usan nombres como `juice.xest.local` o `portal-soc.xest.local` en vez de direcciones. Así la misma orden sirve tanto si el objetivo está en tu Kali como si lo sirve el profesor: solo cambia a qué dirección apunta el nombre. Para los objetivos de tu Kali (lo normal) usa `comun/entornos/objetivos/hosts-puesto`, que los apunta a `127.0.0.1`. Usa `hosts-aula` solo si el profesor sirve los objetivos desde el aula, y nunca mezcles las dos versiones de un mismo nombre. La orden se lanza desde la carpeta donde tengas el material del curso (la que contiene `comun`) y solo añade las líneas si el nombre no existe todavía:

```bash
cd CARPETA_DEL_MATERIAL
getent hosts juice.xest.local || sudo tee -a /etc/hosts < comun/entornos/objetivos/hosts-puesto
getent hosts juice.xest.local portal-soc.xest.local
```

La última orden tiene que mostrar `127.0.0.1` para los dos nombres. Si aparece otra dirección, revisa `/etc/hosts` antes de seguir.

Si `curl` contesta `Connection refused`, el nombre funciona pero el contenedor no está levantado. Si contesta `Could not resolve host`, falta la línea en `/etc/hosts`. Si se queda esperando hasta `timed out`, el nombre apunta a una IP del aula que no está en tu red: revisa que no hayas copiado `hosts-aula`.

Varios laboratorios usan el puerto 8080 (el portal, ZAP, mitmproxy). No los arranques a la vez: para el anterior o usa el puerto alternativo que indique la ficha. Compruébalo con `ss -ltnp`.

## 7. El material del curso

Todo el material está en la web del curso y en el repositorio. Descarga cada práctica en el sistema donde la vas a hacer: las de PPS e IC en el Ubuntu y las de HE en la Kali.

Algunas fichas de unidades anteriores dan por hecho que tienes el material completo en `~/xest-lab/2026-2027`. Si una ficha usa esa ruta, crea la carpeta en el sistema donde vayas a hacerla y copia ahí el material, o ajusta la ruta a tu carpeta.

Trabaja siempre sobre una copia: descomprime el ZIP de la práctica en tu carpeta de trabajo (por ejemplo, `~/pps`, `~/ic` o `~/he`) y conserva el ZIP original por si necesitas empezar de cero. Si te paso material por USB, cópialo antes de usarlo y no trabajes directamente sobre el USB.

## 8. Cómo añadir herramientas

Antes de instalar algo, ten claro qué ficha lo necesita y para qué.

- Paquete del sistema: `apt-cache policy NOMBRE` y después `sudo apt install NOMBRE`, con Internet.
- Herramienta de Python: entorno virtual o `pipx`, desde el proyecto oficial. No deduzcas el nombre del paquete a partir del nombre comercial de la herramienta.
- Contenedor: anota la etiqueta, los puertos, los volúmenes y la prueba que demuestra que funciona.
- Servicio en línea con API: anota la cuenta, el plan y sus límites. Ninguna clase debe depender de él si no hay Internet.

## 9. Al terminar la sesión

Guarda el informe, las órdenes, las versiones y las salidas antes de parar nada.

`docker compose stop` para los contenedores y los deja como están. `docker compose down` los elimina junto con sus redes, aunque normalmente conserva los volúmenes. **Nunca uses `docker compose down -v` con Wazuh**: borra los volúmenes, y con ellos tus alertas, tus agentes registrados y tu configuración.

La instantánea de la Kali no guarda tu Wazuh: Wazuh vive en el Ubuntu, en sus volúmenes de Docker.

Si necesitas volver a empezar, usa la instantánea de la Kali o el procedimiento de reinicio de la práctica, y guarda antes tus evidencias fuera. Anota qué has restaurado: el código, la base de datos, la VM o todo.

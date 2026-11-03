#!/usr/bin/env bash
#
# labnet-up.sh — Laboratorio Kali + Metasploitable en VirtualBox.
# Autor: José Picón
#
# Monta en tu equipo una red interna de VirtualBox llamada "labnet"
# (10.10.10.0/24) donde solo están tu Kali y tu Metasploitable:
#
#   Kali            tarjeta 1: la que ya tenías (NAT) -> Internet y TECNORIBERA
#                   tarjeta 2: red interna labnet     -> 10.10.10.50
#   Metasploitable  tarjeta 1: red interna labnet     -> 10.10.10.13
#                   sin ninguna otra tarjeta: NUNCA tiene Internet ni ve tu red
#
# Las IP las reparte un servidor DHCP de VirtualBox atado a la red labnet,
# con reserva fija por máquina, así que no hay que configurar nada a mano.
#
# Uso:
#   ./labnet-up.sh preparar <metasploitable-linux-2.0.0.zip>   # todo de una vez
#   ./labnet-up.sh importar <zip|vmdk>   # solo crea la VM metasploitable
#   ./labnet-up.sh cablear               # red de las dos VM + DHCP de labnet
#   ./labnet-up.sh comprobar             # revisa el aislamiento (no arranca nada)
#   ./labnet-up.sh foto                  # instantánea 'limpia' de Metasploitable
#   ./labnet-up.sh arrancar              # comprueba y arranca Metasploitable sin ventana
#   ./labnet-up.sh parar                 # apaga Metasploitable
#   ./labnet-up.sh restaurar             # vuelve Metasploitable a la instantánea 'limpia'
#   ./labnet-up.sh estado                # estado y tarjetas de las dos VM
#
# Variables opcionales: KALI_VM="nombre exacto de tu VM Kali" (si no, se busca
# una VM con "kali" en el nombre), VICTIMA_VM (por defecto "metasploitable").

set -euo pipefail

LABNET="${LABNET:-labnet}"
SUBNET="10.10.10"
IP_DHCP="$SUBNET.2"
IP_KALI="$SUBNET.50"
IP_VICTIMA="$SUBNET.13"
VICTIMA_VM="${VICTIMA_VM:-metasploitable}"
FOTO="limpia"
# SHA-256 del ZIP oficial (SourceForge, metasploitable-linux-2.0.0.zip)
ZIP_SHA256="2ae8788e95273eee87bd379a250d86ec52f286fa7fe84773a3a8f6524085a1ff"

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
ambar() { printf '\033[33m%s\033[0m\n' "$*"; }
morir() { rojo "ERROR: $*" >&2; exit 1; }

command -v VBoxManage >/dev/null 2>&1 || morir "no encuentro VBoxManage. ¿Está instalado VirtualBox?"
[[ $EUID -eq 0 ]] && morir "no lo lances con sudo: las VM son de tu usuario, no de root."

existe()     { VBoxManage list vms | grep -q "^\"$1\" "; }
encendida()  { VBoxManage list runningvms | grep -q "^\"$1\" "; }
info()       { VBoxManage showvminfo "$1" --machinereadable 2>/dev/null; }
tarjeta()    { info "$1" | sed -n "s/^nic$2=\"\(.*\)\"$/\1/p"; }
red_int()    { info "$1" | sed -n "s/^intnet$2=\"\(.*\)\"$/\1/p"; }
vacia()      { case "$1" in ""|none|null) return 0;; esac; return 1; }
hay_foto()   { VBoxManage snapshot "$1" list --machinereadable 2>/dev/null | grep -q "=\"$FOTO\"$"; }

kali_vm() {
  if [[ -n "${KALI_VM:-}" ]]; then echo "$KALI_VM"; return; fi
  local n
  n="$(VBoxManage list vms | sed -n 's/^"\(.*\)" {.*}$/\1/p' | grep -i kali || true)"
  [[ -z "$n" ]] && morir "no encuentro ninguna VM con 'kali' en el nombre. Usa: KALI_VM=\"Nombre\" $0 ..."
  [[ "$(wc -l <<<"$n")" -gt 1 ]] && morir "hay varias VM con 'kali' en el nombre:
$n
Elige una: KALI_VM=\"Nombre exacto\" $0 ..."
  echo "$n"
}

apagada_o_morir() {
  encendida "$1" && morir "'$1' está encendida. Apágala del todo (no suspendida) y repite."
  local st; st="$(info "$1" | sed -n 's/^VMState="\(.*\)"$/\1/p')"
  [[ "$st" == "saved" ]] && morir "'$1' está suspendida (estado guardado). Arráncala y apágala del todo, o descarta el estado guardado."
  return 0
}

# ── importar ────────────────────────────────────────────────────────────────
cmd_importar() {
  local origen="${1:-}"
  [[ -f "$origen" ]] || morir "uso: $0 importar <metasploitable-linux-2.0.0.zip | Metasploitable.vmdk>"
  if existe "$VICTIMA_VM"; then ambar "la VM '$VICTIMA_VM' ya existe: no la toco."; return 0; fi

  local carpeta; carpeta="$(VBoxManage list systemproperties | sed -n 's/^Default machine folder: *//p')"
  local destino="$carpeta/$VICTIMA_VM"
  mkdir -p "$destino"

  local vmdk
  case "$origen" in
    *.zip)
      if [[ "$ZIP_SHA256" != __* ]]; then
        echo "Comprobando la huella del ZIP (tarda un poco)…"
        local h; h="$(sha256sum "$origen" 2>/dev/null || shasum -a 256 "$origen")"
        [[ "${h%% *}" == "$ZIP_SHA256" ]] || morir "el ZIP no es el oficial o está incompleto (SHA-256 distinto). Vuelve a copiarlo."
        verde "ZIP correcto."
      fi
      echo "Descomprimiendo en ${destino}…"
      unzip -q -o -j "$origen" '*.vmdk' -d "$destino"
      vmdk="$(ls "$destino"/*.vmdk | head -1)"
      ;;
    *.vmdk) cp "$origen" "$destino/" ; vmdk="$destino/$(basename "$origen")" ;;
    *) morir "tiene que ser el .zip o el .vmdk de Metasploitable 2" ;;
  esac
  [[ -f "$vmdk" ]] || morir "no he encontrado el disco .vmdk"

  VBoxManage createvm --name "$VICTIMA_VM" --ostype Ubuntu --register >/dev/null
  VBoxManage modifyvm "$VICTIMA_VM" --memory 512 --vram 16 --cpus 1 \
    --audio-enabled off --usb off --boot1 disk --boot2 none --boot3 none --boot4 none \
    --nic1 intnet --intnet1 "$LABNET" --cableconnected1 on --nictype1 82540EM \
    --nic2 none --nic3 none --nic4 none
  VBoxManage storagectl "$VICTIMA_VM" --name IDE --add ide --controller PIIX4
  VBoxManage storageattach "$VICTIMA_VM" --storagectl IDE --port 0 --device 0 --type hdd --medium "$vmdk"
  verde "VM '$VICTIMA_VM' creada (512 MB, disco $(basename "$vmdk"), solo en la red '$LABNET')."
}

# ── cablear ─────────────────────────────────────────────────────────────────
dhcp_labnet() {
  if VBoxManage list dhcpservers | grep -q "NetworkName: *$LABNET$"; then
    VBoxManage dhcpserver modify --network="$LABNET" --server-ip="$IP_DHCP" --netmask=255.255.255.0 \
      --lower-ip="$SUBNET.100" --upper-ip="$SUBNET.150" --enable >/dev/null
  else
    VBoxManage dhcpserver add --network="$LABNET" --server-ip="$IP_DHCP" --netmask=255.255.255.0 \
      --lower-ip="$SUBNET.100" --upper-ip="$SUBNET.150" --enable >/dev/null
  fi
}

reservar_ip() {   # VM, nº de tarjeta, IP
  VBoxManage dhcpserver modify --network="$LABNET" --vm="$1" --nic="$2" --fixed-address="$3" >/dev/null
}

cmd_cablear() {
  local kali; kali="$(kali_vm)"
  existe "$VICTIMA_VM" || morir "no existe la VM '$VICTIMA_VM'. Primero: $0 importar <zip>"

  apagada_o_morir "$VICTIMA_VM"
  VBoxManage modifyvm "$VICTIMA_VM" --nic1 intnet --intnet1 "$LABNET" --cableconnected1 on \
    --nic2 none --nic3 none --nic4 none
  verde "$VICTIMA_VM: tarjeta 1 en '$LABNET', las demás quitadas."

  # Kali: la tarjeta 1 no se toca. La de labnet va en la primera libre (2-4).
  local n=""
  for i in 2 3 4; do
    if [[ "$(tarjeta "$kali" $i)" == "intnet" && "$(red_int "$kali" $i)" == "$LABNET" ]]; then n=$i; break; fi
  done
  if [[ -z "$n" ]]; then
    for i in 2 3 4; do vacia "$(tarjeta "$kali" $i)" && { n=$i; break; }; done
    [[ -z "$n" ]] && morir "'$kali' no tiene ninguna tarjeta libre (2, 3 o 4)."
    apagada_o_morir "$kali"
    VBoxManage modifyvm "$kali" --nic$n intnet --intnet$n "$LABNET" --cableconnected$n on
  fi
  verde "$kali: tarjeta $n en '$LABNET' (la tarjeta 1, la de Internet, sigue como estaba: $(tarjeta "$kali" 1))."

  dhcp_labnet
  reservar_ip "$VICTIMA_VM" 1 "$IP_VICTIMA"
  reservar_ip "$kali" "$n" "$IP_KALI"
  verde "DHCP de '$LABNET': $VICTIMA_VM -> $IP_VICTIMA · $kali -> $IP_KALI"
}

# ── comprobar ───────────────────────────────────────────────────────────────
cmd_comprobar() {
  local mal=0 kali; kali="$(kali_vm)"
  echo "Comprobando el aislamiento de '$LABNET'…"
  if existe "$VICTIMA_VM"; then
    for i in 1 2 3 4 5 6 7 8; do
      local t; t="$(tarjeta "$VICTIMA_VM" $i)"
      case "$t" in
        ""|none|null) ;;
        intnet) [[ "$(red_int "$VICTIMA_VM" $i)" == "$LABNET" ]] || { rojo "  $VICTIMA_VM: tarjeta $i en otra red interna"; mal=1; } ;;
        *) rojo "  $VICTIMA_VM: tarjeta $i en modo '$t'. Metasploitable solo puede estar en '$LABNET'."; mal=1 ;;
      esac
    done
    [[ "$(tarjeta "$VICTIMA_VM" 1)" == "intnet" ]] || { rojo "  $VICTIMA_VM: la tarjeta 1 no está en '$LABNET'"; mal=1; }
  else
    rojo "  no existe la VM '$VICTIMA_VM'"; mal=1
  fi
  local enlab=0
  for i in 1 2 3 4 5 6 7 8; do
    local t; t="$(tarjeta "$kali" $i)"
    [[ "$t" == "intnet" && "$(red_int "$kali" $i)" == "$LABNET" ]] && enlab=1
    [[ "$t" == "bridged" ]] && ambar "  aviso: $kali tiene la tarjeta $i en adaptador puente. Para estas prácticas basta NAT."
  done
  [[ $enlab -eq 1 ]] || { rojo "  $kali no tiene ninguna tarjeta en '$LABNET'"; mal=1; }
  VBoxManage list dhcpservers | grep -q "NetworkName: *$LABNET$" || { rojo "  no hay DHCP en '$LABNET'"; mal=1; }
  [[ $mal -eq 0 ]] || morir "algo no está bien. Arréglalo con: $0 cablear"
  verde "Todo bien: Metasploitable solo ve la red '$LABNET' y tu Kali está dentro."
}

# ── instantánea, arranque, parada ───────────────────────────────────────────
cmd_foto() {
  existe "$VICTIMA_VM" || morir "no existe '$VICTIMA_VM'"
  if hay_foto "$VICTIMA_VM"; then ambar "la instantánea '$FOTO' ya existe."; return 0; fi
  VBoxManage snapshot "$VICTIMA_VM" take "$FOTO" --description "Metasploitable recién importada" >/dev/null
  verde "instantánea '$FOTO' hecha."
}

cmd_arrancar() {
  cmd_comprobar
  encendida "$VICTIMA_VM" && { ambar "$VICTIMA_VM ya está encendida."; return 0; }
  VBoxManage startvm "$VICTIMA_VM" --type headless >/dev/null
  verde "$VICTIMA_VM arrancando sin ventana. Tarda un minuto; luego, desde Kali: ping -c 2 $IP_VICTIMA"
}

cmd_parar() {
  encendida "$VICTIMA_VM" || { ambar "$VICTIMA_VM ya está apagada."; return 0; }
  VBoxManage controlvm "$VICTIMA_VM" acpipowerbutton 2>/dev/null || true
  for _ in $(seq 1 20); do encendida "$VICTIMA_VM" || { verde "apagada."; return 0; }; sleep 1; done
  VBoxManage controlvm "$VICTIMA_VM" poweroff >/dev/null 2>&1 || true
  ambar "no respondía: la he apagado de golpe."
}

cmd_restaurar() {
  hay_foto "$VICTIMA_VM" || morir "no hay instantánea '$FOTO'. Hazla con: $0 foto"
  encendida "$VICTIMA_VM" && VBoxManage controlvm "$VICTIMA_VM" poweroff >/dev/null 2>&1 || true
  sleep 2
  VBoxManage snapshot "$VICTIMA_VM" restore "$FOTO" >/dev/null
  verde "$VICTIMA_VM vuelta al estado '$FOTO'."
}

cmd_estado() {
  local kali; kali="$(kali_vm 2>/dev/null || echo '(no encontrada)')"
  for vm in "$kali" "$VICTIMA_VM"; do
    if ! existe "$vm"; then printf '%-22s no existe\n' "$vm"; continue; fi
    local st="apagada"; encendida "$vm" && st="encendida"
    local t=""
    for i in 1 2 3 4; do
      local x; x="$(tarjeta "$vm" $i)"
      vacia "$x" && continue
      [[ "$x" == "intnet" ]] && x="intnet:$(red_int "$vm" $i)"
      t+=" nic$i=$x"
    done
    printf '%-22s %-10s%s\n' "$vm" "$st" "$t"
  done
}

cmd_preparar() {
  local zip="${1:-}"
  existe "$VICTIMA_VM" || cmd_importar "$zip"
  cmd_cablear
  cmd_foto
  cmd_comprobar
  echo
  verde "Listo. Para arrancar Metasploitable: $0 arrancar"
}

case "${1:-}" in
  preparar)  cmd_preparar "${2:-}" ;;
  importar)  cmd_importar "${2:-}" ;;
  cablear)   cmd_cablear ;;
  comprobar) cmd_comprobar ;;
  foto)      cmd_foto ;;
  arrancar)  cmd_arrancar ;;
  parar)     cmd_parar ;;
  restaurar) cmd_restaurar ;;
  estado)    cmd_estado ;;
  *) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac

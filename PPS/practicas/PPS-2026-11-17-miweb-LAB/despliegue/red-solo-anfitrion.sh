#!/usr/bin/env bash
# Conecta tu Kali con tu Ubuntu por una red solo-anfitrión de VirtualBox:
#   Ubuntu (anfitrión)  vboxnet0  192.168.56.1
#   Kali                DHCP      192.168.56.101 a 192.168.56.150
# Así, desde la Kali llegas a tu web en http://192.168.56.1:8080/ y en los
# registros aparece la IP de la Kali, no 127.0.0.1.
# La Kali tiene que estar APAGADA. No toca ni la tarjeta 1 (NAT) ni la de labnet.
#   bash despliegue/red-solo-anfitrion.sh
#   KALI_VM="nombre exacto" bash despliegue/red-solo-anfitrion.sh
set -euo pipefail
IF=vboxnet0

morir() { echo "ERROR: $*" >&2; exit 1; }
command -v VBoxManage >/dev/null || morir "no encuentro VBoxManage"
[[ $EUID -eq 0 ]] && morir "no lo lances con sudo"

if [[ -z "${KALI_VM:-}" ]]; then
    KALI_VM=$(VBoxManage list vms | sed -n 's/^"\(.*\)" {.*}$/\1/p' | grep -i kali | head -1 || true)
fi
[[ -n "$KALI_VM" ]] || morir "no encuentro tu VM Kali. Indícala con KALI_VM=\"nombre\""
echo "VM Kali: $KALI_VM"

# 1. Interfaz solo-anfitrión en el Ubuntu
if ! VBoxManage list hostonlyifs | grep -q "^Name: *$IF$"; then
    VBoxManage hostonlyif create
fi
VBoxManage hostonlyif ipconfig "$IF" --ip 192.168.56.1 --netmask 255.255.255.0

# 2. DHCP de esa red
if VBoxManage list dhcpservers | grep -q "HostInterfaceNetworking-$IF"; then
    VBoxManage dhcpserver modify --interface="$IF" --server-ip=192.168.56.100 \
        --netmask=255.255.255.0 --lower-ip=192.168.56.101 --upper-ip=192.168.56.150 --enable
else
    VBoxManage dhcpserver add --interface="$IF" --server-ip=192.168.56.100 \
        --netmask=255.255.255.0 --lower-ip=192.168.56.101 --upper-ip=192.168.56.150 --enable
fi

# 3. Tarjeta de la Kali: si ya hay una en vboxnet0 la deja; si no, usa la primera libre (2-4)
info=$(VBoxManage showvminfo "$KALI_VM" --machinereadable)
n=""
for i in 2 3 4; do
    if [[ "$(sed -n "s/^nic$i=\"\(.*\)\"$/\1/p" <<<"$info")" == hostonly &&
          "$(sed -n "s/^hostonlyadapter$i=\"\(.*\)\"$/\1/p" <<<"$info")" == "$IF" ]]; then
        n=$i; break
    fi
done
if [[ -z "$n" ]]; then
    for i in 2 3 4; do
        t=$(sed -n "s/^nic$i=\"\(.*\)\"$/\1/p" <<<"$info")
        [[ -z "$t" || "$t" == none ]] && { n=$i; break; }
    done
    [[ -n "$n" ]] || morir "tu Kali no tiene ninguna tarjeta libre (2, 3 o 4)"
    grep -q '^VMState="poweroff"\|^VMState="aborted"\|^VMState="saved"' <<<"$info" \
        || morir "apaga la Kali antes (no basta con suspenderla) y vuelve a lanzarlo"
    VBoxManage modifyvm "$KALI_VM" --nic$n hostonly --hostonlyadapter$n "$IF" --cableconnected$n on
fi
echo "OK: tarjeta $n de la Kali en $IF. Tu Ubuntu es 192.168.56.1."
echo "Arranca la Kali y comprueba con: ip -br a   (verás una IP 192.168.56.1xx)"

# Recetas de jq para el caso (cópialas y ajusta la ruta)

Saca las alertas de miweb y de nginx a un fichero de trabajo. Desde el equipo
del manager:

```
cd ~/wazuh-docker/single-node
docker compose exec -T wazuh.manager \
  tail -n 5000 /var/ossec/logs/alerts/alerts.json > ~/ic/caso.json
```

Línea temporal de las alertas de tu web (hora, IP, regla, descripción):

```
jq -rc 'select(.rule.groups | index("miweb"))
  | [.timestamp, .data.srcip // .data.ip // "-", .rule.id, .rule.level, .rule.description]
  | @tsv' ~/ic/caso.json | sort
```

Cuántas veces ha saltado cada regla (para ver el perfil del ataque):

```
jq -rc 'select(.rule.groups | index("miweb")) | .rule.id + " " + .rule.description' \
  ~/ic/caso.json | sort | uniq -c | sort -rn
```

Solo lo que venga de la IP de tu Kali (cámbiala por la tuya):

```
jq -rc 'select(.data.srcip=="192.168.56.101")
  | [.timestamp, .rule.id, .rule.description] | @tsv' ~/ic/caso.json
```

Las alertas de nivel alto (12 o más), que son las que mirarías primero:

```
jq -rc 'select(.rule.level>=12) | [.timestamp, .rule.id, .rule.description] | @tsv' \
  ~/ic/caso.json
```

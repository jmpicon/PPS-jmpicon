# Terminal de seguridad — base Kali Linux (herramientas preinstaladas)
FROM kalilinux/kali-rolling:latest

ENV DEBIAN_FRONTEND=noninteractive \
    TERM=xterm-256color \
    LANG=es_ES.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
    # Shell y utilidades
    bash curl wget git nano vim less tree jq locales \
    ca-certificates procps htop file \
    # Herramientas de red
    nmap netcat-traditional dnsutils whois iputils-ping traceroute \
    # Web / HTTP scanners
    nikto dirb gobuster wfuzz whatweb wafw00f \
    # Inyección SQL
    sqlmap \
    # Criptografía
    openssl \
    # Fuerza bruta / contraseñas
    john hydra \
    # Python3
    python3 python3-pip python3-venv \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Locales en español
RUN sed -i '/es_ES.UTF-8/s/^# //g' /etc/locale.gen 2>/dev/null || true \
 && locale-gen 2>/dev/null || true

# pip tools adicionales de seguridad
RUN pip3 install --no-cache-dir --break-system-packages \
    requests httpx beautifulsoup4 \
    pyjwt cryptography \
    safety bandit semgrep \
    impacket

# ttyd — terminal web
ARG TTYD_VERSION=1.7.7
RUN curl -fsSL \
    "https://github.com/tsl0922/ttyd/releases/download/${TTYD_VERSION}/ttyd.x86_64" \
    -o /usr/local/bin/ttyd \
 && chmod +x /usr/local/bin/ttyd

# Usuario no-root
RUN groupadd -r student && useradd -r -g student -m -s /bin/bash student

# MOTD
COPY motd.sh /etc/profile.d/motd.sh
RUN chmod +x /etc/profile.d/motd.sh

USER student
WORKDIR /home/student

RUN mkdir -p ~/lab ~/wordlists && touch ~/.hushlogin

COPY --chown=student:student wordlists/ /home/student/wordlists/

EXPOSE 7681

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -sf http://localhost:7681 || exit 1

CMD ["/usr/local/bin/ttyd", \
     "--port", "7681", \
     "--writable", \
     "--max-clients", "20", \
     "/bin/bash", "--login"]

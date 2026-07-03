#cloud-config
# VM initialisation — sets hostname, timezone, swap, and base packages
# Applied once at first boot via cloud-init

hostname: ${hostname}
manage_etc_hosts: true
timezone: Europe/Warsaw

# Create 2 GB swap (important for small SKUs)
swap:
  filename: /swapfile
  size: 2G
  maxsize: 2G

# Ensure packages are up-to-date at first boot
package_update: true
package_upgrade: true

packages:
  - curl
  - git
  - htop
  - jq
  - unzip
  - fail2ban
  - ufw
  - auditd

# Enable auditd at boot
runcmd:
  - systemctl enable auditd
  - systemctl start auditd
  # UFW: deny all inbound, allow outbound, allow SSH + HTTP + HTTPS
  - ufw --force reset
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow 22/tcp
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw --force enable

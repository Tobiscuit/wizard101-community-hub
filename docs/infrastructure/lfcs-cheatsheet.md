# LFCS Practice on Nexus Core (Safe Zone)
Your `nexus-core-01` is a live Ubuntu 24.04 server. It's the perfect practice ground.
Here are safe, read-only commands to try directly in your SSH terminal.

## 1. System Reconnaissance (Know your Ship)
*   `uname -a` -> Show Kernel version and System Arch.
*   `hostnamectl` -> Fancy system status.
*   `lscpu` -> Detailed CPU info (See what "vCPU" really means).
*   `free -h` -> Check RAM usage (human readable).
*   `df -h` -> Check Disk space (human readable).

## 2. Process Management (The Bridge)
*   `htop` -> Interactive process viewer (Like Task Manager). Press `F10` or `q` to quit.
*   `ps aux | grep docker` -> Find all running Docker processes.
*   `top` -> The old school version of htop.

## 3. Storage & Files (The Cargo)
*   `ls -lah` -> List all files (including hidden) with sizes.
*   `find /etc -name "*.conf" | head` -> Find config files (safe search).
*   `du -sh /var/log` -> Check size of log directory.

## 4. Services (The Engines)
*   `systemctl status docker` -> Check if Docker engine is healthy.
*   `journalctl -u docker -n 50 --no-pager` -> Read the last 50 lines of Docker logs.

## 5. Network (The Comms)
*   `ip a` -> Show IP addresses (Find your 178... IP).
*   `ss -tulpen` -> Show all open ports (Look for 22, 80, 443, 8000).
*   `ping -c 4 google.com` -> Test internet connectivity.

## ⚠️ Dangerous Commands (Avoid for now)
*   `rm -rf /` (THE BLACK HOLE)
*   `systemctl stop ssh` (Locks you out)
*   `ufw enable` (Could block SSH if not configured carefully - stick to Terraform Firewall for now).

---
**Tip**: Type `history` to see commands you've run before!

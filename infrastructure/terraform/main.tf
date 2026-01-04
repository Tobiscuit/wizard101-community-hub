terraform {
  required_providers {
    hcloud = {
      source = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
    vercel = {
      source = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

variable "hcloud_token" {
  sensitive = true
}

variable "vercel_api_token" {
  sensitive = true
}

provider "hcloud" {
  token = var.hcloud_token
}

provider "vercel" {
  api_token = var.vercel_api_token
}

variable "vercel_team_id" {
  description = "The Team ID for Vercel (if applicable)"
  default     = ""
}

// 1. Define the SSH Key (Jrcodex Admin)
resource "hcloud_ssh_key" "jrcodex_admin" {
  name       = "jrcodex-rhel-key"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPYkbi84R3/FYCx4PClpX/NJUavpVdiOzU/bnUZLcRFB"
}

// 2. Define the Hetzner Server (The "Nexus" - Multitenant Host)
resource "hcloud_server" "nexus_production" {
  name        = "nexus-core-01" // Truly generic: The center of your constellation.
  image       = "ubuntu-24.04"
  server_type = "ccx23" // 4 vCPU, 16GB RAM
  location    = "ash"   // Ashburn, VA
  ssh_keys    = [hcloud_ssh_key.jrcodex_admin.id]
  
  // Cloud-init to install Coolify
  user_data = file("${path.module}/user-data.yml")
}

// 2. Define the Vercel DNS Record
// Points api.commons.jrcodex.dev -> Hetzner IP
// Note: This connects ONLY the 'commons' project for now. 
// You can make other tf files (e.g. `blog.tf`) for other domains later!
resource "vercel_dns_record" "api_commons" {
  domain = "jrcodex.dev"
  name   = "api.commons" 
  type   = "A"
  value  = hcloud_server.nexus_production.ipv4_address
}

// 2b. Frontend Domain: commons.jrcodex.dev
resource "vercel_dns_record" "commons" {
  domain = "jrcodex.dev"
  name   = "commons" 
  type   = "A"
  value  = hcloud_server.nexus_production.ipv4_address
}

output "server_ip" {
  value = hcloud_server.nexus_production.ipv4_address
}

// 3. Security: The Fortress Wall
resource "hcloud_firewall" "nexus_security" {
  name = "nexus-firewall"
  
  // Rule 1: Allow SSH (Port 22) - Critical for access
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  // Rule 2: Allow Web Traffic (80/443) - For the website
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  // Rule 3: Allow Coolify Admin (8000) - ONLY ME (Tunnel or Home IP)
  // Even with Tunneling, blocking 8000 public is good practice.
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "8000"
    source_ips = ["76.208.38.206/32"] // Lockdown to your current IP
  }
}

// Attach firewall to the server
resource "hcloud_firewall_attachment" "nexus_security_attachment" {
  firewall_id = hcloud_firewall.nexus_security.id
  server_ids  = [hcloud_server.nexus_production.id]
}

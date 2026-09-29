#!/bin/bash
# ==============================================================================
# OceanEmbed — EC2 Instance Setup Script (run once on a fresh Ubuntu instance)
# ==============================================================================
set -euo pipefail

echo "🌊 OceanEmbed EC2 Setup — Starting..."

# --------------------------------------------------------------------------
# 1. System updates
# --------------------------------------------------------------------------
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# --------------------------------------------------------------------------
# 2. Install Docker
# --------------------------------------------------------------------------
echo "🐳 Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

# --------------------------------------------------------------------------
# 3. Install Node.js 22 (for local testing / debugging without Docker)
# --------------------------------------------------------------------------
echo "📗 Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# --------------------------------------------------------------------------
# 4. Install useful tools
# --------------------------------------------------------------------------
echo "🔧 Installing utilities..."
sudo apt-get install -y git htop nginx certbot python3-certbot-nginx

# --------------------------------------------------------------------------
# 5. Configure firewall (UFW)
# --------------------------------------------------------------------------
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# --------------------------------------------------------------------------
# 6. Create app directory
# --------------------------------------------------------------------------
echo "📁 Creating app directory..."
sudo mkdir -p /opt/oceanembed
sudo chown $USER:$USER /opt/oceanembed

# --------------------------------------------------------------------------
# 7. Enable Docker on boot
# --------------------------------------------------------------------------
sudo systemctl enable docker
sudo systemctl start docker

echo ""
echo "✅ ════════════════════════════════════════════════"
echo "   OceanEmbed EC2 Setup Complete!"
echo "   ════════════════════════════════════════════════"
echo ""
echo "   Next steps:"
echo "   1. Log out and log back in (for docker group to take effect)"
echo "   2. Clone your repo:  git clone <your-repo-url> /opt/oceanembed"
echo "   3. Create .env:      nano /opt/oceanembed/.env"
echo "   4. Deploy:           cd /opt/oceanembed && ./deploy/deploy.sh"
echo ""

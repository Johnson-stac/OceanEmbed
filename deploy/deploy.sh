#!/bin/bash
# ==============================================================================
# OceanEmbed — Deployment Script
# Run this from the project root: ./deploy/deploy.sh
# ==============================================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🌊 OceanEmbed Deployment — Starting..."
echo "   Directory: $PROJECT_ROOT"
echo ""

# --------------------------------------------------------------------------
# 1. Check prerequisites
# --------------------------------------------------------------------------
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Run ./deploy/setup-ec2.sh first."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Create it with:"
    echo "   echo 'GROQ_API_KEY=your_key' > .env"
    echo "   echo 'GROQ_MODEL=llama3-8b-8192' >> .env"
    echo "   echo 'PORT=3000' >> .env"
    exit 1
fi

# --------------------------------------------------------------------------
# 2. Pull latest code (if in a git repo)
# --------------------------------------------------------------------------
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || git pull origin master || echo "⚠️  Git pull skipped (check branch name)"
fi

# --------------------------------------------------------------------------
# 3. Build and deploy with Docker Compose
# --------------------------------------------------------------------------
echo "🔨 Building Docker image..."
docker compose -f deploy/docker-compose.yml build --no-cache

echo "🚀 Starting containers..."
docker compose -f deploy/docker-compose.yml down 2>/dev/null || true
docker compose -f deploy/docker-compose.yml up -d

# --------------------------------------------------------------------------
# 4. Clean up old images
# --------------------------------------------------------------------------
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# --------------------------------------------------------------------------
# 5. Show status
# --------------------------------------------------------------------------
echo ""
echo "✅ ════════════════════════════════════════════════"
echo "   OceanEmbed Deployed Successfully!"
echo "   ════════════════════════════════════════════════"
echo ""
echo "   Status:"
docker compose -f deploy/docker-compose.yml ps
echo ""
echo "   Logs:   docker compose -f deploy/docker-compose.yml logs -f"
echo "   Stop:   docker compose -f deploy/docker-compose.yml down"
echo "   Health: curl http://localhost:3000/api/health"
echo ""

# Wait a moment and check health
sleep 3
echo "🏥 Health check..."
if curl -s http://localhost:3000/api/health | grep -q '"ok"'; then
    echo "✅ Server is healthy!"
else
    echo "⚠️  Server may still be starting up. Check logs with:"
    echo "   docker compose -f deploy/docker-compose.yml logs -f"
fi

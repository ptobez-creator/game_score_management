#!/bin/bash
# Deployment script for EC2
# This script is called by GitHub Actions via SSH

set -e

DEPLOY_DIR="/home/ubuntu/game_score_management"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend/my_frontend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================${NC}"
echo -e "${BLUE}FIFA Tournament Deployment Started${NC}"
echo -e "${BLUE}===================================${NC}"

# Pull latest code
echo -e "${BLUE}➜ Pulling latest code...${NC}"
cd $DEPLOY_DIR
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}✓ Code updated${NC}"

# Backend deployment
echo -e "${BLUE}➜ Deploying backend...${NC}"
cd $BACKEND_DIR
npm install --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Restart backend with PM2
pm2 restart fifa-backend || pm2 start npm --name "fifa-backend" -- start
pm2 save
echo -e "${GREEN}✓ Backend restarted${NC}"

# Frontend deployment (build happens in CI)
# The built files are copied via SCP in the GitHub Actions workflow

# Restart Nginx to serve updated frontend
echo -e "${BLUE}➜ Restarting Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✓ Nginx restarted${NC}"

# Health checks
echo -e "${BLUE}➜ Running health checks...${NC}"
sleep 2

BACKEND_CHECK=$(curl -s http://localhost:5000/auth/ping || echo "failed")
if [[ $BACKEND_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

FRONTEND_CHECK=$(curl -s http://localhost/ | head -c 100)
if [[ ! -z $FRONTEND_CHECK ]]; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    exit 1
fi

# Show status
echo -e "${BLUE}➜ Process status:${NC}"
pm2 list

echo -e "${BLUE}===================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${BLUE}===================================${NC}"

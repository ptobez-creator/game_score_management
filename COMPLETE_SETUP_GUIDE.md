# Complete AWS EC2 + GitHub Actions Setup Guide

## Overview

This guide shows how to:
1. Set up GitHub Actions CI/CD pipeline
2. Deploy automatically to AWS EC2 free tier
3. Monitor deployments with Slack notifications

**Time to complete: ~30-45 minutes**

---

## Part 1: GitHub Repository Setup (5 minutes)

### Step 1.1: Create GitHub Repository

1. Go to https://github.com/ptobez-creator
2. Click **New repository**
3. Name it: `game_score_management`
4. Set to **Public** (free plan)
5. Click **Create repository**

### Step 1.2: Push Your Code

```bash
cd ~/game_score_management

# Configure git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your-email@gmail.com"

# Initialize repository
git init
git add .
git commit -m "Initial commit: FIFA Tournament app"
git branch -M main

# Add remote and push
git remote add origin https://github.com/ptobez-creator/game_score_management.git
git push -u origin main
```

**Verify**: You should see your code on https://github.com/ptobez-creator/game_score_management

---

## Part 2: GitHub Secrets Setup (3 minutes)

GitHub Secrets are encrypted variables used by the CI/CD pipeline.

### Step 2.1: Get Your EC2 Details

**Get EC2 Public IP:**
1. Go to AWS Console → EC2 → Instances
2. Find your instance
3. Copy **Public IPv4 address** (format: 54.168.123.45)

**Get Your Private Key Content:**
```bash
# View your .pem file content
cat /path/to/your-key-pair.pem

# You'll see:
# -----BEGIN RSA PRIVATE KEY-----
# MIIEpAIBAAKCAQEA...
# ...lots of characters...
# -----END RSA PRIVATE KEY-----
```

### Step 2.2: Add Secrets to GitHub

1. Go to your repo: https://github.com/ptobez-creator/game_score_management
2. Click **Settings** (top menu)
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**

**Add Secret 1: `EC2_HOST`**
- Name: `EC2_HOST`
- Value: `54.168.123.45` (your EC2 public IP)
- Click **Add secret**

**Add Secret 2: `EC2_PRIVATE_KEY`**
- Name: `EC2_PRIVATE_KEY`
- Value: [Paste entire .pem file content from Step 2.1]
- Click **Add secret**

**Optional Secret 3: `SLACK_WEBHOOK`**
- Skip for now, can add later if you want Slack notifications

**Verify**: You should see both secrets listed (masked)

---

## Part 3: Environment Files Setup (5 minutes)

### Step 3.1: Backend .env

Create `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fifa?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=production
```

**Important**: 
- Replace `mongodb+srv://...` with your actual MongoDB Atlas connection string
- You can add this to `.gitignore` so it's not committed to GitHub
- Create the same file on your EC2 instance

### Step 3.2: Frontend .env.production

Create `frontend/my_frontend/.env.production`:

```
REACT_APP_API_URL=http://54.168.123.45:5000
```

Replace IP with your EC2 public IP.

### Step 3.3: .gitignore

Make sure `.gitignore` contains:

```
# Environment variables
.env
.env.production
.env.local
.env.*.local

# Dependencies
node_modules/
.npm

# Build
build/
dist/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# PM2
.pm2/
```

---

## Part 4: EC2 Instance Preparation (10 minutes)

### Step 4.1: SSH into Your EC2

```bash
ssh -i /path/to/your-key.pem ubuntu@54.168.123.45
```

### Step 4.2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Verify
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

### Step 4.3: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/ptobez-creator/game_score_management.git
cd game_score_management
```

### Step 4.4: Initial Setup

```bash
# Setup backend
cd backend
npm install
pm2 start npm --name "fifa-backend" -- start
pm2 save
cd ..

# Setup frontend
cd frontend/my_frontend
npm install
npm run build
cd ../..

# Show status
pm2 list
```

### Step 4.5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/game_score_management
```

Paste this:

```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name 54.168.123.45;

    # Frontend
    location / {
        root /home/ubuntu/game_score_management/frontend/my_frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location ~ ^/(tournaments|games|leaderboard|users|teams|auth|gamescoreapproval) {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X` → `Y` → `Enter`

```bash
# Enable config
sudo ln -s /etc/nginx/sites-available/game_score_management /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 4.6: Add .env File

Add your `.env` file to EC2:

```bash
nano /home/ubuntu/game_score_management/backend/.env
```

Paste your backend environment variables and save.

### Step 4.7: Test Manually

```bash
# Test backend
curl http://localhost:5000/auth/ping

# Test frontend
curl http://localhost/ | head -20

# Check processes
pm2 list
```

---

## Part 5: Test CI/CD Pipeline (5 minutes)

### Step 5.1: Make a Test Change

```bash
# On your local machine
cd ~/game_score_management

# Make a small change
echo "# Updated: $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin main
```

### Step 5.2: Watch the Pipeline

1. Go to https://github.com/ptobez-creator/game_score_management
2. Click **Actions** tab
3. Click on the workflow run
4. Watch each step execute:
   - ✅ Backend Tests
   - ✅ Frontend Build
   - ✅ Deploy to EC2
   - ✅ Health checks

### Step 5.3: Verify Deployment

Option A: Check GitHub Actions logs
- Click "Deploy to EC2" step
- Scroll to see output

Option B: SSH into EC2
```bash
ssh -i /path/to/your-key.pem ubuntu@54.168.123.45
pm2 logs fifa-backend
```

Option C: Test in browser
```
http://54.168.123.45
```

---

## Part 6: Workflow Explanation

### How the Pipeline Works

```
You push code to main branch
          ↓
GitHub detects push
          ↓
┌─────────────────────┐
│  Backend Tests (1m) │  ← Tests backend code
└──────────┬──────────┘
           │
┌──────────v──────────┐
│ Frontend Build (2m) │  ← Builds optimized production build
└──────────┬──────────┘
           │
   Both passed? ✅
           │
┌──────────v──────────┐
│ Deploy to EC2 (1m)  │  ← Copies files, restarts services
└──────────┬──────────┘
           │
┌──────────v──────────┐
│ Health Checks (30s) │  ← Verifies everything works
└──────────┬──────────┘
           │
      ✅ Done!
```

### What Gets Deployed

1. **Backend**: Latest code + npm dependencies
2. **Frontend**: Optimized production build
3. **Services**: PM2 restarts backend, Nginx reloads
4. **Verification**: Health checks confirm it works

---

## Part 7: Environment Files Checklist

| File | Location | Status |
|------|----------|--------|
| `.env` | `backend/.env` | Add to EC2 manually, gitignore locally |
| `.env.production` | `frontend/my_frontend/.env.production` | Commit to repo |
| `.github/workflows/deploy.yml` | In repo | ✅ Already created |
| `DEPLOY_GITHUB_ACTIONS.md` | Root of repo | ✅ Reference guide |
| `GITHUB_ACTIONS_QUICKSTART.md` | Root of repo | ✅ Quick reference |

---

## Part 8: Monitoring & Troubleshooting

### View Deployment Logs

**On GitHub:**
1. Go to Actions tab
2. Click the workflow run
3. Click "Deploy to EC2" job
4. See SSH output

**On EC2:**
```bash
ssh -i your-key.pem ubuntu@your-ip

# Backend logs
pm2 logs fifa-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check status
pm2 status
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "SSH key permission denied" | Verify entire .pem file content in `EC2_PRIVATE_KEY` secret |
| "Cannot connect to EC2" | Check security group allows port 22 from GitHub |
| "Backend doesn't restart" | SSH in: `pm2 restart fifa-backend` |
| "Frontend shows old content" | Hard refresh browser (Ctrl+Shift+Delete) |
| "Deployment triggered but nothing changed" | Check logs - might be same code |

### Manual Commands

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ip

# Restart services
pm2 restart fifa-backend
sudo systemctl reload nginx

# Pull latest code
cd /home/ubuntu/game_score_management
git pull origin main

# Check what's running
pm2 list
pm2 logs

# View system resources
df -h          # Disk usage
free -h        # Memory
top            # Processes
```

---

## Part 9: Optional Enhancements

### 9.1: Slack Notifications

1. Create Slack app: https://api.slack.com/apps/create
2. Add "Incoming Webhooks"
3. Create webhook for your channel
4. Copy webhook URL
5. Add GitHub Secret: `SLACK_WEBHOOK=https://hooks.slack.com/...`

Now failed deployments will notify Slack!

### 9.2: SSL/HTTPS (Let's Encrypt)

```bash
ssh -i your-key.pem ubuntu@your-ip

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (use your domain)
sudo certbot certonly --nginx -d yourdomain.com

# Update Nginx to use SSL (modify /etc/nginx/sites-available/game_score_management)
# Then: sudo systemctl reload nginx
```

### 9.3: Domain Name

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Point to your EC2 IP
3. Update Nginx config to use domain name
4. Get SSL certificate with domain

---

## Part 10: Security Checklist

- ✅ Keep `.pem` file secure (never commit to Git)
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate MongoDB password (update connection string)
- ✅ Update JWT secret (change in `.env`)
- ✅ Set `NODE_ENV=production`
- ✅ Use HTTPS with SSL certificate (Optional but recommended)
- ✅ Restrict EC2 security group (allow only needed ports)
- ✅ Regular updates: `sudo apt update && sudo apt upgrade -y`

---

## Part 11: Daily Operations

### To Deploy Manually

```bash
# Push to main (triggers automatic deployment)
git push origin main

# Or SSH and restart
ssh -i your-key.pem ubuntu@your-ip
pm2 restart fifa-backend
```

### To Monitor

```bash
# Git logs
git log --oneline

# GitHub Actions
Go to: https://github.com/ptobez-creator/game_score_management/actions

# EC2 health
ssh -i your-key.pem ubuntu@your-ip
pm2 status
pm2 logs
```

### To Troubleshoot

1. Check GitHub Actions logs first
2. SSH into EC2 and check logs
3. Verify environment variables
4. Check MongoDB connection
5. Check disk space on EC2

---

## Part 12: Next Steps

1. ✅ Create GitHub repo
2. ✅ Add secrets to GitHub  
3. ✅ Prepare EC2 instance
4. ✅ Add environment files
5. ✅ Test pipeline with code push
6. ⏭️ Monitor first few deployments
7. ⏭️ (Optional) Set up Slack notifications
8. ⏭️ (Optional) Add SSL/HTTPS
9. ⏭️ (Optional) Get custom domain

---

## Summary of Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | Main CI/CD pipeline |
| `scripts/deploy.sh` | Deployment script |
| `DEPLOY_GITHUB_ACTIONS.md` | Detailed setup guide |
| `GITHUB_ACTIONS_QUICKSTART.md` | Quick reference |
| `.env.example` | Environment variables template |

---

## Support Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **AWS EC2 Docs**: https://docs.aws.amazon.com/ec2/
- **Node.js Deployment**: https://nodejs.org/en/docs/guides/
- **Nginx Docs**: https://nginx.org/en/docs/

---

## Estimated Costs (Free Tier)

| Service | Cost | Reason |
|---------|------|--------|
| EC2 (t2.micro, 750 hrs/month) | FREE | Free tier eligible |
| GitHub Actions (2,000 min/month) | FREE | Free for public repos |
| MongoDB Atlas (512MB) | FREE | Free tier |
| Let's Encrypt SSL | FREE | Free certificates |
| **TOTAL** | **$0/month** | On free tier |

---

**You're ready to deploy! 🚀**

Next: Push to GitHub and watch it deploy automatically!

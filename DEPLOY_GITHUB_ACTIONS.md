# GitHub Actions CI/CD Setup Guide

This guide explains how to set up the automated CI/CD pipeline for deploying the FIFA Tournament app to AWS EC2.

## Prerequisites

- GitHub account with repository
- AWS EC2 instance (free tier t2.micro)
- EC2 instance with public IP address
- EC2 security group allowing SSH (port 22) access
- EC2 key pair (.pem file)

## Step 1: Create GitHub Repository

1. Go to https://github.com/ptobez-creator
2. Create a new repository named `game_score_management`
3. Clone locally and push your code:

```bash
cd ~/game_score_management
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ptobez-creator/game_score_management.git
git push -u origin main
```

## Step 2: Set Up GitHub Secrets

GitHub Secrets are encrypted environment variables used by the workflow.

### How to Add Secrets:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

### Required Secrets:

#### `EC2_HOST`
- **Value**: Your EC2 instance's public IP address
- **Example**: `54.168.123.45`
- **Where to find**: AWS Console → EC2 → Instances → Public IPv4 address

#### `EC2_PRIVATE_KEY`
- **Value**: Contents of your EC2 key pair (.pem file)
- **Where to find**: The .pem file you downloaded from AWS

**To get the private key content:**
```bash
cat your-key-pair.pem
# Copy the entire output including -----BEGIN and -----END lines
```

- Then paste it into the Secret value field

#### `APP_API_URL` (Optional, if using custom domain)
- **Value**: Your API URL
- **Example**: `https://your-domain.com`
- **Default**: Uses EC2 public IP if not set

#### `SLACK_WEBHOOK` (Optional, for Slack notifications)
- **Value**: Your Slack webhook URL
- **Where to get**:
  1. Create a Slack app: https://api.slack.com/apps
  2. Enable Incoming Webhooks
  3. Create a new webhook for your channel
  4. Copy the webhook URL

## Step 3: EC2 Preparation Checklist

Before deploying, make sure your EC2 instance has:

- [ ] Ubuntu 22.04 LTS installed
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally: `sudo npm install -g pm2`
- [ ] Nginx installed: `sudo apt install nginx`
- [ ] MongoDB connection string configured in `.env`
- [ ] SSH access from GitHub Actions IP (usually anywhere for testing)

### EC2 Setup Commands (if not already done):

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone repository
cd /home/ubuntu
git clone https://github.com/ptobez-creator/game_score_management.git
cd game_score_management

# Setup backend
cd backend
npm install
pm2 start npm --name "fifa-backend" -- start
pm2 save

# Configure Nginx (see main AWS guide)
```

## Step 4: Create `.env` Files

### Backend `.env` - `backend/.env`

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fifa?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend `.env.production` - `frontend/my_frontend/.env.production`

```
REACT_APP_API_URL=https://your-domain.com
```

**Note**: Push these to `.gitignore` so they're not committed. Add them manually to EC2.

## Step 5: Test the Workflow

1. Make a small change to your code (e.g., update README)
2. Push to main branch:
```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

3. Watch the pipeline:
   - Go to your GitHub repo
   - Click **Actions** tab
   - Watch the workflow run in real-time

4. Each step shows:
   - ✅ Green checkmark = Passed
   - ❌ Red X = Failed
   - Logs for debugging

## Workflow Steps Explained

```
┌─────────────────────────────────┐
│  Code pushed to main branch     │
└────────────┬────────────────────┘
             │
             ├─────────────────────────────────┐
             │                                 │
    ┌────────v────────┐            ┌──────────v──────────┐
    │  Backend Tests  │            │  Frontend Build     │
    └────────┬────────┘            └──────────┬──────────┘
             │                                 │
             └────────────────┬────────────────┘
                              │
                              ├─ Both pass?
                              │
                      ┌───────v────────┐
                      │  Deploy to EC2 │
                      └───────┬────────┘
                              │
                      ┌───────v────────┐
                      │  Run Tests     │
                      └───────┬────────┘
                              │
                      ┌───────v────────┐
                      │  Slack Message │
                      └────────────────┘
```

## Troubleshooting

### Workflow fails with "SSH key not found"
- Verify `EC2_PRIVATE_KEY` secret is set correctly
- Make sure to include `-----BEGIN` and `-----END` lines

### Backend fails to start after deployment
- SSH into EC2 and check logs: `pm2 logs fifa-backend`
- Verify `.env` file has correct MongoDB connection string
- Manually restart: `pm2 restart fifa-backend`

### Frontend shows old content
- Clear browser cache (Ctrl+Shift+Delete)
- Verify frontend build was uploaded: `ls /home/ubuntu/game_score_management/frontend/my_frontend/build/`

### Deployment doesn't trigger
- Make sure you're pushing to `main` branch
- Check GitHub Actions is enabled (Settings → Actions)
- Verify workflow file is in `.github/workflows/deploy.yml`

## Manual Deployment (Without Pushing Code)

If you need to redeploy without code changes:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Manual restart
cd /home/ubuntu/game_score_management
git pull origin main
cd backend && npm install && pm2 restart fifa-backend
cd ../frontend/my_frontend && npm install && npm run build
sudo systemctl reload nginx
```

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| EC2_HOST | Yes | 54.168.0.0 | EC2 public IP |
| EC2_PRIVATE_KEY | Yes | -----BEGIN PRIVATE KEY----- | PEM content |
| APP_API_URL | No | https://domain.com | For CORS headers |
| SLACK_WEBHOOK | No | https://hooks.slack.com/... | For notifications |

## What Gets Deployed

- ✅ Backend code (latest from main)
- ✅ Frontend build (optimized production build)
- ✅ Dependencies (npm install)
- ✅ Process restart (PM2)
- ✅ Nginx reload

## Monitoring Deployments

### View deployment logs:
1. GitHub Actions tab → Click the workflow run
2. Click on "Deploy to AWS EC2" step
3. See full SSH output

### Monitor EC2:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check backend status
pm2 status
pm2 logs fifa-backend

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log

# Check disk space
df -h

# Check memory
free -h
```

## Advanced: Custom Slack Messages

Edit `.github/workflows/deploy.yml` to customize Slack notifications with:
- Environment (staging/production)
- Deployment time
- Build number
- Version tags

## Security Best Practices

1. ✅ Use GitHub Secrets for sensitive data
2. ✅ Keep .pem files secure (never commit to Git)
3. ✅ Use IAM roles on EC2 (future enhancement)
4. ✅ Rotate MongoDB credentials regularly
5. ✅ Use SSL/HTTPS and Let's Encrypt
6. ✅ Regular security audits

## Next Steps

1. Create GitHub repo and add secrets
2. Test first deployment with a small change
3. Monitor logs and verify everything works
4. Set up Slack notifications (optional)
5. Consider adding E2E tests before deployment
6. Set up alerts for failed deployments

For issues or questions, check GitHub Actions logs or SSH into EC2 for manual debugging.

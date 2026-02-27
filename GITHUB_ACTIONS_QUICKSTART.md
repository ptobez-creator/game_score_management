# FIFA Tournament - GitHub Actions CI/CD Quick Start

## What was set up:

✅ **Automated CI/CD Pipeline** that:
- Tests backend code on every push
- Builds frontend on every push  
- Deploys to EC2 automatically on push to `main` branch
- Sends Slack notifications (optional)
- Performs health checks after deployment

## Quick Setup (5 minutes):

### 1. Push to GitHub

```bash
cd ~/game_score_management

# Initialize git and push to GitHub
git remote add origin https://github.com/ptobez-creator/game_score_management.git
git branch -M main
git add .
git commit -m "Initial commit with CI/CD"
git push -u origin main
```

### 2. Add GitHub Secrets

Go to: https://github.com/ptobez-creator/game_score_management/settings/secrets/actions

Add these 2 required secrets:

**Secret 1: `EC2_HOST`**
```
Value: YOUR_EC2_PUBLIC_IP (like 54.168.123.45)
```

**Secret 2: `EC2_PRIVATE_KEY`**
```
Value: [Paste entire contents of your .pem file, including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----]
```

### 3. Test It

Make a small change and push:
```bash
git add .
git commit -m "Test deployment"
git push
```

Then watch it deploy:
- Go to Actions tab on GitHub
- See it build and deploy in real-time
- Check your EC2 instance!

## File Structure

```
.github/
└── workflows/
    └── deploy.yml                    ← Main CI/CD pipeline
backend/
├── package.json
├── server.js
└── .env                              ← Add your MongoDB URI here
frontend/
└── my_frontend/
    ├── package.json
    ├── .env.production                ← Add API URL here
    └── public/
DEPLOY_GITHUB_ACTIONS.md             ← Full setup guide
.env.example                          ← Copy and fill out
scripts/
└── deploy.sh                         ← Deployment script
```

## Secrets Explained

| Secret | What it contains | How to get it |
|--------|------------------|--------------|
| `EC2_HOST` | Your server's IP address | AWS EC2 Console → Instances → Public IPv4 |
| `EC2_PRIVATE_KEY` | SSH private key | Your .pem file contents |

## Workflow in Action

```
1. You push code to main branch
         ↓
2. GitHub Actions runs tests (1 min)
         ↓
3. GitHub Actions builds frontend (2 min)
         ↓
4. If both pass → Deploys to EC2 (1 min)
         ↓
5. Runs health checks
         ↓
6. Complete! Your app is live 🎉
```

## Monitoring Deployments

### View logs on GitHub:
1. Go to your repo → **Actions** tab
2. Click the latest workflow run
3. Expand each job to see detailed logs

### SSH into EC2 to check manually:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check backend
pm2 logs fifa-backend

# Check frontend
curl http://localhost

# Check Nginx
sudo systemctl status nginx
```

## Common Issues & Fixes

### "SSH key permission denied"
- Make sure `EC2_PRIVATE_KEY` has the FULL content including `-----BEGIN` and `-----END`
- No extra spaces or line breaks

### "Failed to connect to EC2"
- Verify EC2 security group allows port 22 (SSH) from GitHub
- Double-check IP address in `EC2_HOST`

### "Backend didn't restart"
- SSH into EC2: `pm2 logs fifa-backend`
- Manually restart: `pm2 restart fifa-backend`

### "Frontend shows old content"  
- Clear browser cache (Ctrl+Shift+Delete)
- Check GitHub Actions log to ensure frontend deployed

## Environment Files Needed

### `backend/.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fifa
JWT_SECRET=your_secret_here
NODE_ENV=production
```

### `frontend/my_frontend/.env.production`
```
REACT_APP_API_URL=https://your-ec2-ip-or-domain.com
```

## Deploying Without Code Changes

If you need to redeploy the current main branch:

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Pull and restart
cd /home/ubuntu/game_score_management
git pull origin main
pm2 restart fifa-backend
```

Or make a dummy commit:
```bash
git commit --allow-empty -m "Trigger redeployment"
git push
```

## Advanced: Slack Notifications

To get Slack alerts when deployment succeeds/fails:

1. Create a Slack app: https://api.slack.com/apps/create
2. Click "Incoming Webhooks" → Add New Webhook to Workspace
3. Copy the webhook URL
4. Add GitHub Secret: `SLACK_WEBHOOK` with the webhook URL

## What Gets Deployed

- ✅ Latest code from main branch
- ✅ Backend with npm dependencies  
- ✅ Frontend production build
- ✅ Everything restarted automatically
- ✅ Health checks to verify it works

## Next Steps

1. ✅ Set up GitHub repository
2. ✅ Add the 2 required secrets
3. ✅ Test with a push to main
4. ✅ SSH into EC2 and verify deployment
5. ⏭️ (Optional) Set up Slack notifications
6. ⏭️ (Optional) Add automated tests
7. ⏭️ (Optional) Set up staging environment

## Support

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **See full setup guide**: `DEPLOY_GITHUB_ACTIONS.md`
- **SSH into EC2 for manual debugging**: Check issue-specific logs with `pm2 logs`

---

**Ready to deploy?** Push your code to main and watch the magic happen! 🚀

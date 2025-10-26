# 🚂 Deploy Backend to Railway.app

Railway.app is the **perfect platform** for your SocialCommerce backend because it fully supports:
- ✅ Socket.IO (real-time messaging)
- ✅ WebSocket connections
- ✅ Persistent server processes
- ✅ Free tier (500 hours/month)
- ✅ Automatic HTTPS
- ✅ Easy deployment

---

## 🚀 Quick Deploy (5 Minutes)

### Method 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```powershell
   cd C:\Users\jlove\projects\social-commerce-ai-platform
   git add .
   git commit -m "Add Railway deployment"
   git push
   ```

2. **Sign up for Railway**:
   - Go to https://railway.app
   - Click "Login with GitHub"
   - Authorize Railway

3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `social-commerce-ai-platform` repo
   - Select the `backend` directory

4. **Configure Environment Variables**:
   Click on your service → "Variables" tab → Add these:
   
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy!**
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app.up.railway.app`

---

### Method 2: Deploy with Railway CLI

1. **Install Railway CLI**:
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```powershell
   railway login
   ```

3. **Initialize Project**:
   ```powershell
   cd backend
   railway init
   ```

4. **Add Environment Variables**:
   ```powershell
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI=your-mongodb-connection-string
   railway variables set JWT_SECRET=your-secret-key
   railway variables set FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**:
   ```powershell
   railway up
   ```

---

## 📝 Required Environment Variables

### MongoDB Atlas Connection String
Get from: https://cloud.mongodb.com
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-commerce
```

### JWT Secret (Generate a secure random string)
```powershell
# Generate with Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend URL
After deploying frontend to Vercel:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔧 Post-Deployment Setup

### 1. Get Your Backend URL
After deployment, Railway gives you a URL like:
```
https://social-commerce-backend.up.railway.app
```

### 2. Update Frontend Configuration
Update `frontend/src/config/environment.ts`:
```typescript
export const API_BASE_URL = 'https://social-commerce-backend.up.railway.app';
export const SOCKET_URL = 'https://social-commerce-backend.up.railway.app';
```

### 3. Update Backend CORS
Your backend `.env` should have:
```
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### 4. Test Your API
```powershell
# Health check
curl https://your-backend.up.railway.app/api/health

# Should return:
# {"status":"healthy","timestamp":"2024-...","uptime":123}
```

---

## 🎯 Verify Everything Works

### Test Real-Time Features:
1. Open your deployed frontend
2. Create 2 accounts (use different browsers/incognito)
3. Send messages between them
4. ✅ Messages should appear instantly!

### Check Backend Logs:
- Go to Railway dashboard
- Click on your service
- View "Deployments" → Click latest → "View Logs"
- You should see:
  ```
  ✅ Connected to MongoDB
  🚀 Server running on port 5000
  ```

---

## 💰 Railway Pricing

**Free Tier:**
- 500 execution hours/month
- $5 credit/month
- Unlimited projects
- Perfect for development & small apps

**Pro Tier ($20/month):**
- Unlimited execution hours
- Priority support
- Custom domains
- Team collaboration

For your use case, **free tier is perfect** to start!

---

## 🔐 Security Checklist

Before going live:

- ✅ Use MongoDB Atlas (not local MongoDB)
- ✅ Strong JWT_SECRET (use the crypto command above)
- ✅ Set NODE_ENV=production
- ✅ Update FRONTEND_URL to your Vercel domain
- ✅ Enable MongoDB IP whitelist (allow all: `0.0.0.0/0`)
- ✅ Review backend logs for any errors

---

## 🔄 Auto-Deploy on Git Push

Railway automatically redeploys when you push to GitHub:

```powershell
# Make changes to your code
git add .
git commit -m "Update backend"
git push

# Railway automatically redeploys! 🎉
```

---

## 📊 Monitor Your App

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History of all deployments
- **Variables**: Manage environment variables

### View Logs:
```powershell
railway logs
```

### Check Service Status:
```powershell
railway status
```

---

## 🐛 Troubleshooting

### Backend won't start:
1. Check logs in Railway dashboard
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct

### Socket.IO not working:
1. Check FRONTEND_URL in backend env
2. Verify CORS settings
3. Check browser console for WebSocket errors

### Database connection failed:
1. Use MongoDB Atlas, not local MongoDB
2. Check connection string format
3. Verify IP whitelist allows Railway IPs (`0.0.0.0/0`)

### 502 Bad Gateway:
1. Check if backend is running (view logs)
2. Verify PORT environment variable
3. Ensure npm start command is correct

---

## 🚀 Next Steps After Deployment

1. **Deploy Frontend to Vercel**:
   ```powershell
   cd frontend
   vercel --prod
   ```

2. **Update Frontend Environment**:
   - Set backend URL in Vercel environment variables
   - Redeploy frontend

3. **Test Everything**:
   - Create accounts
   - Send messages
   - Create posts
   - Test real-time features

4. **Add Custom Domain** (Optional):
   - In Railway dashboard
   - Settings → Domains
   - Add your custom domain

---

## ✨ You're Done!

Your backend is now deployed with:
- ✅ Full Socket.IO support
- ✅ Real-time messaging
- ✅ HTTPS enabled
- ✅ Auto-scaling
- ✅ Persistent connections

**Backend URL**: `https://[your-app].up.railway.app`

**Next**: Deploy your frontend to Vercel and connect them together!

---

## 📚 Helpful Links

- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://cloud.mongodb.com
- Railway Discord: https://discord.gg/railway
- Your Railway Dashboard: https://railway.app/dashboard

**Need help? Check the logs in your Railway dashboard!** 🚂

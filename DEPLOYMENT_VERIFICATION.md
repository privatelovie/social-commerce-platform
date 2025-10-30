# Deployment Verification Guide

## 🚀 Auto-Deployment Status

Your changes have been pushed to GitHub and should automatically trigger deployments on:
- **Railway** (Backend) - Usually takes 3-5 minutes
- **Vercel** (Frontend) - Usually takes 2-3 minutes

---

## ✅ Step 1: Verify Backend Deployment (Railway)

### Check Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Find your social-commerce-ai-platform backend project
3. Click on **Deployments** tab
4. Look for the latest deployment (commit: `01d3700`)
5. Wait for status to show **"Success"** (green checkmark)

### Test Backend Health Endpoint
Once deployment succeeds, test your backend:

```bash
# Replace with your actual Railway URL
curl https://your-backend.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Check Railway Logs (if issues occur)
```bash
railway logs --tail
```

Or view logs in Railway dashboard under the **Logs** tab.

---

## ✅ Step 2: Verify Frontend Deployment (Vercel)

### Check Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your social-commerce-platform project
3. Click on **Deployments**
4. Look for the latest deployment (commit: `01d3700`)
5. Wait for status to show **"Ready"** (green)

### Important: Production Domain
Vercel should be using the production domain. If you see the deployment URL, click on it to visit your site.

---

## ✅ Step 3: Clear Browser Cache

**This is critical!** Old JavaScript/CSS files may be cached.

### Windows:
- **Chrome/Edge:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox:** `Ctrl + Shift + Delete` → Select "Cached Images and Files" → Clear

### Alternative (Hard Reset):
1. Open DevTools (`F12`)
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

---

## ✅ Step 4: Test New Features

### 4.1 Dark Mode (Default)
- [x] Open the website
- [x] **Verify dark background** (#0f0f0f) is default
- [x] Find theme toggle button in navigation (moon/sun icon)
- [x] Click to switch to light mode
- [x] Refresh page - should remember your preference

### 4.2 Logout Button
- [x] Click logout button (red logout icon in desktop navigation)
- [x] Should redirect to landing page (not /login)
- [x] Open DevTools → Application → Local Storage
- [x] Verify all storage is cleared
- [x] Try logging back in - should work normally

### 4.3 Clickable Hashtags
- [x] View any post in the feed
- [x] Hashtags should be **blue** and **clickable**
- [x] Hover over hashtag - should show **underline**
- [x] Click hashtag - check console for log message
- [x] (Future: will navigate to hashtag explorer)

### 4.4 Product Images
- [x] Scroll through posts
- [x] Verify product images are:
  - **Professional quality** (Unsplash images)
  - **Consistent** (no random shuffling)
  - **Loading correctly** (no broken images)
- [x] Check different product categories:
  - Electronics (headphones, phones, laptops)
  - Fashion (shoes, bags, clothes)
  - Home (furniture, decor)
  - Fitness (gym equipment)
  - Beauty (makeup, skincare)
  - **Food** ⭐ NEW (pizza, pasta, coffee)
  - **Phone** ⭐ NEW (iPhones, Android phones)

### 4.5 Reel Upload Component
**Note:** Component is created but needs UI integration.

To test (requires adding button first):
- Would need to add upload button to VideoReelsPage
- Click button to open ReelUpload dialog
- Upload a video file (MP4, max 100MB)
- Add title, description, hashtags
- Search and link a product
- Upload and verify success

---

## ✅ Step 5: Check for Issues

### Open Browser Console
Press `F12` and check for:

#### ❌ Common Errors to Look For:

**CORS Errors:**
```
Access to fetch at 'https://backend.railway.app/api/...' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Fix:** Verify `FRONTEND_URL` in Railway environment variables matches your Vercel URL exactly.

**Authentication Errors:**
```
401 Unauthorized
JWT token invalid
```

**Fix:** Check if you're logged in. Try logging out and back in.

**Socket.IO Connection Errors:**
```
WebSocket connection failed
Socket.IO connection error
```

**Fix:** Check Socket.IO CORS settings in backend and verify SOCKET_URL environment variable.

---

## ✅ Step 6: Test Core Features

### Authentication Flow
- [x] **Register** new account
  - Click "Create Account"
  - Enter username, email, password
  - Should redirect to main feed
  - Verify you're logged in

- [x] **Login** with existing account
  - Click "Sign In"
  - Enter credentials
  - Should redirect to feed

- [x] **Google OAuth** (if configured)
  - Click "Sign in with Google"
  - Should open Google popup
  - Authenticate and return to app
  - Check for CORS/redirect errors

### Feed & Interactions
- [x] View posts in feed
- [x] Like a post
- [x] Comment on a post
- [x] Bookmark a post
- [x] Click on product card
- [x] Add product to cart

### Navigation
- [x] Click "Explore" - should load explore page
- [x] Click "Reels" - should load video reels
- [x] Click "Messages" - should load messaging
- [x] Click "Profile" - should load your profile
- [x] Search for products/users - should show results

### Cart & Checkout
- [x] Open cart (shopping cart icon)
- [x] View cart items
- [x] Update quantities
- [x] Remove items
- [x] Proceed to checkout

---

## ⚠️ Environment Variables Verification

### Backend (Railway)
Verify these environment variables are set:

```bash
PORT=5000                                    # Auto-assigned by Railway
MONGODB_URI=mongodb+srv://...                # Your MongoDB Atlas connection
JWT_SECRET=your-secret-key                   # Random secure string
GOOGLE_CLIENT_ID=your-google-client-id       # From Google Cloud Console
GOOGLE_CLIENT_SECRET=your-google-secret      # From Google Cloud Console
FRONTEND_URL=https://your-app.vercel.app     # Must match Vercel URL exactly
NODE_ENV=production
```

### Frontend (Vercel)
Verify these environment variables are set:

```bash
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_SOCKET_URL=https://your-backend.railway.app
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
NODE_ENV=production
```

**How to Check:**
- Railway: Project Settings → Variables
- Vercel: Project Settings → Environment Variables

---

## 🐛 Troubleshooting Common Issues

### Issue 1: "Site not updating"
**Solution:**
1. Hard refresh browser (`Ctrl + Shift + R`)
2. Clear browser cache completely
3. Try incognito/private window
4. Check Vercel deployment status

### Issue 2: "Backend not responding"
**Solution:**
1. Check Railway deployment status
2. Test health endpoint: `curl https://your-backend.railway.app/api/health`
3. Check Railway logs for errors
4. Verify MongoDB is accessible (IP whitelist)

### Issue 3: "Can't login / Authentication errors"
**Solution:**
1. Check browser console for specific errors
2. Verify JWT_SECRET is set in Railway
3. Try clearing localStorage and cookies
4. Check backend logs during login attempt

### Issue 4: "Messaging not working"
**Solution:**
1. Check Socket.IO connection in browser console
2. Verify SOCKET_URL environment variable in Vercel
3. Check Socket.IO CORS settings in backend
4. Verify WebSocket connections are allowed

### Issue 5: "Google OAuth not working"
**Solution:**
1. Follow `GOOGLE_OAUTH_FIX.md` guide
2. Verify Google Cloud Console authorized origins
3. Check redirect URIs match your Vercel domain
4. Verify GOOGLE_CLIENT_ID matches in both frontend and backend

---

## 📊 Deployment Status Checklist

### Pre-Deployment ✅
- [x] Changes committed to Git
- [x] Changes pushed to GitHub
- [x] Comprehensive documentation created

### During Deployment ⏳
- [ ] Railway deployment triggered
- [ ] Railway deployment successful
- [ ] Vercel deployment triggered
- [ ] Vercel deployment successful

### Post-Deployment
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Dark mode is default
- [ ] Logout button works
- [ ] Hashtags are clickable
- [ ] Product images are real/consistent
- [ ] Authentication works (register/login)
- [ ] Can create posts
- [ ] Can interact with posts (like/comment)
- [ ] Navigation works
- [ ] Cart functionality works
- [ ] Messaging loads (even if empty)
- [ ] No console errors

---

## 🔗 Quick Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 📞 Next Steps After Verification

### If Everything Works:
1. ✅ Mark completed features in your project tracker
2. 🧪 Perform thorough user testing
3. 📱 Test on mobile devices
4. 🎨 Review UI/UX for improvements
5. 📊 Monitor for any errors in production

### If Issues Found:
1. 📋 Document the specific error message
2. 🔍 Check relevant documentation file:
   - `CORS_FIX.md` for CORS issues
   - `GOOGLE_OAUTH_FIX.md` for Google auth
   - `VERCEL_404_FIX.md` for Vercel 404s
   - `FIXES_APPLIED_COMPREHENSIVE.md` for feature info
3. 🐛 Check browser console and server logs
4. 🔧 Fix issue and redeploy

---

## 📝 Deployment Notes

**Commit Deployed:** `01d3700`

**Features in This Deployment:**
- ✅ Dark mode set as default
- ✅ Logout button fixed
- ✅ Clickable hashtags
- ✅ Reel upload component (needs UI integration)
- ✅ Food & phone product image categories
- ✅ All product images using real Unsplash photos

**Time to Deploy:**
- Backend: 3-5 minutes
- Frontend: 2-3 minutes
- **Total:** ~5-8 minutes from push

---

**Last Updated:** 2024
**Deployment ID:** 01d3700
**Status:** Waiting for auto-deployment to complete

# 🔧 Google OAuth Fix

## ❌ Error: origin_mismatch

### Error Message:
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
Error 400: origin_mismatch
```

### Root Cause:
Your Vercel URL is not registered as an authorized JavaScript origin in Google Cloud Console.

---

## ✅ Quick Fix

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create one)
3. Go to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID
1. Look for "OAuth 2.0 Client IDs" section
2. Click on your Web client (or create new one)

### Step 3: Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add:

```
http://localhost:3000
http://localhost:3001
https://social-commerce-platform.vercel.app
```

### Step 4: Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, add:

```
http://localhost:3000
http://localhost:3000/auth/google/callback
https://social-commerce-platform.vercel.app
https://social-commerce-platform.vercel.app/auth/google/callback
```

### Step 5: Save Changes
Click **Save** button at the bottom

---

## 🔑 Update Environment Variables

### Frontend (Vercel):
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to Settings → Environment Variables
4. Add or update:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   ```
5. Redeploy after saving

### Backend (Railway):
1. Go to https://railway.app/
2. Click your project
3. Go to Variables
4. Add or update:
   ```
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   ```

---

## 📝 Step-by-Step with Screenshots

### 1. Google Cloud Console Setup

**Navigate to Credentials:**
```
Google Cloud Console
→ Select Project
→ Menu (☰)
→ APIs & Services
→ Credentials
```

**Create OAuth Client ID (if needed):**
```
1. Click "+ CREATE CREDENTIALS"
2. Select "OAuth client ID"
3. Application type: "Web application"
4. Name: "Social Commerce Platform"
5. Click "CREATE"
```

**Configure OAuth Client:**
```
Authorized JavaScript origins:
✅ http://localhost:3000
✅ https://social-commerce-platform.vercel.app

Authorized redirect URIs:
✅ http://localhost:3000
✅ https://social-commerce-platform.vercel.app
✅ https://social-commerce-platform.vercel.app/auth/google/callback

Click SAVE
```

### 2. Get Your Client ID

After saving, you'll see:
- **Client ID**: `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123xyz`

Copy the **Client ID** (you'll need it for env variables)

---

## 🚀 Deploy Updated Config

### After Adding Origins in Google Cloud:

1. **No code changes needed** - just configuration
2. **Wait 2-3 minutes** for Google to process changes
3. **Hard refresh your browser** (Ctrl+Shift+R)
4. **Try Google login again**

---

## 🧪 Test Google OAuth

1. Go to your Vercel app
2. Click "Sign in with Google"
3. Should redirect to Google login
4. After login, redirects back to your app
5. Check if user is logged in

### Success Indicators:
✅ No "origin_mismatch" error  
✅ Google login popup appears  
✅ Can select Google account  
✅ Redirects back to app  
✅ User is logged in  
✅ Token in localStorage  

---

## ⚠️ Common Issues

### Issue 1: Still Getting origin_mismatch
**Wait 2-3 minutes** after saving in Google Cloud Console. Changes take time to propagate.

### Issue 2: Wrong Client ID
Make sure the Client ID in Vercel matches the one from Google Cloud Console.

**Check:**
```javascript
// In browser console
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
// Should match the Client ID from Google Cloud
```

### Issue 3: Redirect URI Not Authorized
Make sure you added the redirect URI exactly as shown, including:
- Protocol (https://)
- Domain
- Path (/auth/google/callback)

### Issue 4: Multiple Google Projects
Make sure you're using the Client ID from the **correct Google project**.

---

## 🔍 Debugging

### Check Current Origin:
```javascript
// In browser console
console.log(window.location.origin);
// Should be: https://social-commerce-platform.vercel.app
```

### Verify Client ID:
```javascript
// In browser console on your app
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
// Should be your Google Client ID
```

### Test OAuth Flow:
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Sign in with Google"
4. Watch for redirect to accounts.google.com
5. Check for any error responses
```

---

## 📋 Checklist

Before testing Google OAuth:

- [ ] Created/selected project in Google Cloud Console
- [ ] Created OAuth 2.0 Client ID
- [ ] Added `https://social-commerce-platform.vercel.app` to Authorized JavaScript origins
- [ ] Added redirect URIs
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 2-3 minutes for changes to propagate
- [ ] Added VITE_GOOGLE_CLIENT_ID to Vercel env variables
- [ ] Added GOOGLE_CLIENT_ID to Railway env variables
- [ ] Redeployed frontend (if needed)
- [ ] Hard refreshed browser

---

## 🎯 Alternative: Use Regular Login

If you want to skip Google OAuth for now:

**Just use regular email/password login:**
1. Click "Register" instead of "Sign in with Google"
2. Create account with email/password
3. Login with those credentials
4. Works without Google OAuth setup

**Google OAuth is optional!** Regular login works fine.

---

## 📝 Environment Variable Format

### Correct Format:
```bash
# Vercel (frontend/.env)
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com

# Railway (backend/.env)
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
```

### Incorrect Format:
```bash
❌ VITE_GOOGLE_CLIENT_ID="123456789..." (with quotes)
❌ GOOGLE_CLIENT_ID=<your-client-id> (placeholder text)
❌ Missing or wrong prefix (REACT_APP_ instead of VITE_)
```

---

## 🔐 Security Notes

1. **Never commit Client Secret** to git
2. **Use environment variables** for Client ID
3. **Client ID is public** - safe to expose in frontend
4. **Client Secret is private** - only in backend
5. **Restrict API keys** in Google Cloud Console

---

## ✅ Success!

Google OAuth is working when:
1. No origin_mismatch error
2. Google login popup appears
3. Can select account
4. Redirects back to your app
5. User is logged in with Google profile
6. Avatar and name from Google account appear

---

## 🆘 Still Not Working?

### Option 1: Disable Google OAuth Temporarily
Comment out Google login button in your frontend code and use regular login.

### Option 2: Use Local Testing
Test with `http://localhost:3000` first to make sure OAuth flow works locally.

### Option 3: Check Google Cloud Console Logs
```
Google Cloud Console
→ APIs & Services
→ Credentials
→ Click your OAuth Client ID
→ Check if your domain is listed
```

---

## 📚 Official Documentation

- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web/sign-in)
- [OAuth 2.0 Errors](https://developers.google.com/identity/protocols/oauth2/web-server#errors)

---

**Quick Summary:**
1. Add your Vercel URL to Google Cloud Console
2. Wait 2-3 minutes
3. Hard refresh browser
4. Try Google login again

**Or just use regular email/password login!** 🎯

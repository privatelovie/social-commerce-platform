# Backend Connection Diagnostic Guide

## Quick Backend Health Check

Use these commands to verify your backend is working correctly.

### 1. Test Backend Health Endpoint

```bash
# Replace with your actual Railway URL
curl https://your-backend.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345
}
```

---

### 2. Test MongoDB Connection

```bash
curl https://your-backend.railway.app/api/health/db
```

**Expected Response:**
```json
{
  "database": "connected",
  "status": "ok"
}
```

If **disconnected**, check:
- MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- `MONGODB_URI` environment variable in Railway
- MongoDB cluster is running

---

### 3. Test Authentication Endpoints

#### Register Test User
```bash
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "displayName": "Test User"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser123",
    "email": "test@example.com",
    "displayName": "Test User",
    "isVerified": false
  }
}
```

#### Login Test
```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

---

### 4. Check CORS Configuration

From browser console (F12), run:

```javascript
fetch('https://your-backend.railway.app/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ CORS/Connection error:', err));
```

**Common CORS Errors:**

If you see:
```
Access-Control-Allow-Origin header does not match
```

**Fix:**
1. Go to Railway dashboard
2. Check `FRONTEND_URL` environment variable
3. Must exactly match your Vercel URL (including https://, no trailing slash)

Example:
```bash
FRONTEND_URL=https://your-app.vercel.app
```

---

### 5. Test Socket.IO Connection

From browser console:

```javascript
const socket = io('https://your-backend.railway.app', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Socket.IO connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket.IO error:', error);
});
```

---

### 6. Check Environment Variables

#### Backend (Railway)
Go to Railway → Your Project → Variables

Required variables:
```bash
✓ PORT                    (auto-assigned by Railway)
✓ MONGODB_URI             (from MongoDB Atlas)
✓ JWT_SECRET              (random secure string)
✓ GOOGLE_CLIENT_ID        (from Google Cloud Console)
✓ GOOGLE_CLIENT_SECRET    (from Google Cloud Console)
✓ FRONTEND_URL            (your Vercel URL)
✓ NODE_ENV=production
```

#### Frontend (Vercel)
Go to Vercel → Your Project → Settings → Environment Variables

Required variables:
```bash
✓ REACT_APP_API_URL           (Railway backend /api)
✓ REACT_APP_SOCKET_URL        (Railway backend root)
✓ REACT_APP_GOOGLE_CLIENT_ID  (from Google Cloud Console)
✓ NODE_ENV=production
```

---

### 7. Common Issues & Solutions

#### Issue: "Network Error" or "Failed to fetch"
**Causes:**
- Backend not deployed/running
- Wrong API URL in frontend
- CORS misconfiguration

**Check:**
```bash
# Test if backend is up
curl https://your-backend.railway.app/api/health

# Check Railway logs
railway logs --tail

# Verify REACT_APP_API_URL in Vercel settings
```

---

#### Issue: "401 Unauthorized" on all requests
**Causes:**
- JWT token expired
- JWT_SECRET mismatch or not set
- Token not being sent from frontend

**Fix:**
1. Logout and login again
2. Check JWT_SECRET is set in Railway
3. Clear browser localStorage
4. Check Network tab → Request Headers for Authorization header

---

#### Issue: "MongoDB connection failed"
**Causes:**
- IP not whitelisted in MongoDB Atlas
- Invalid MONGODB_URI
- MongoDB cluster paused/deleted

**Fix:**
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow all)
3. Wait 1-2 minutes for propagation
4. Check MONGODB_URI format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

---

#### Issue: Google OAuth not working
**Causes:**
- Wrong redirect URIs in Google Console
- GOOGLE_CLIENT_ID mismatch
- Authorized origins not set

**Fix:**
Refer to `GOOGLE_OAUTH_FIX.md` for complete setup guide.

---

### 8. Test Messaging System

#### Check Socket.IO from Frontend

Open browser console on your deployed app:

```javascript
// Check if socket is connected
console.log('Socket connected:', window.socket?.connected);

// Listen for messages
if (window.socket) {
  window.socket.on('message:new', (msg) => {
    console.log('New message:', msg);
  });
}
```

#### Send Test Message via API

```bash
# Get your auth token first (from localStorage or login response)
TOKEN="your-jwt-token-here"

curl -X POST https://your-backend.railway.app/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipientId": "recipient-user-id",
    "content": "Test message",
    "type": "text"
  }'
```

---

### 9. Monitoring & Logs

#### View Backend Logs (Railway)
```bash
railway logs --tail
```

Or in Railway dashboard: Your Project → Logs tab

**Look for:**
- Server startup messages
- MongoDB connection status
- API request logs
- Error messages

#### View Frontend Logs (Vercel)
Go to Vercel → Your Project → Deployments → Latest Deployment → Runtime Logs

#### Browser Console Logs
Press F12 → Console tab

**Look for:**
- API request failures
- CORS errors
- Authentication errors
- Socket.IO connection status

---

### 10. Performance Check

#### Test API Response Time
```bash
time curl https://your-backend.railway.app/api/health
```

**Good:** < 500ms
**Acceptable:** 500ms - 2s
**Slow:** > 2s (may indicate backend issues)

#### Check Frontend Load Time
Use Chrome DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check DOMContentLoaded and Load times

**Good:** < 3s
**Acceptable:** 3-5s
**Slow:** > 5s

---

## Automated Diagnostic Script

Save this as `test-backend.sh` (Linux/Mac) or `test-backend.ps1` (Windows):

### Bash Script (Linux/Mac)
```bash
#!/bin/bash

BACKEND_URL="https://your-backend.railway.app"

echo "🔍 Testing Backend Connection..."
echo ""

echo "1️⃣ Health Check:"
curl -s "$BACKEND_URL/api/health" | jq '.'
echo ""

echo "2️⃣ Testing Register:"
curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test'$(date +%s)'","email":"test'$(date +%s)'@example.com","password":"Test123!","displayName":"Test User"}' \
  | jq '.'
echo ""

echo "✅ Diagnostic complete!"
```

### PowerShell Script (Windows)
```powershell
$BACKEND_URL = "https://your-backend.railway.app"

Write-Host "🔍 Testing Backend Connection..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣ Health Check:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -Method Get | ConvertTo-Json
Write-Host ""

Write-Host "2️⃣ Testing Register:" -ForegroundColor Yellow
$body = @{
    username = "test$(Get-Date -Format FileDateTime)"
    email = "test$(Get-Date -Format FileDateTime)@example.com"
    password = "Test123!"
    displayName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/register" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

Write-Host "✅ Diagnostic complete!" -ForegroundColor Green
```

---

## Quick Checklist

Before opening a support ticket, verify:

- [ ] Backend health endpoint returns 200 OK
- [ ] MongoDB connection successful
- [ ] All environment variables set correctly
- [ ] CORS configuration includes frontend URL
- [ ] Frontend can reach backend (no CORS errors)
- [ ] Auth endpoints respond correctly
- [ ] Socket.IO connection working
- [ ] Railway logs show no critical errors
- [ ] Vercel build succeeded without errors
- [ ] Browser console shows no red errors

---

**Need More Help?**
- Check `FIXES_APPLIED_COMPREHENSIVE.md` for feature documentation
- Check `CORS_FIX.md` for CORS issues
- Check `GOOGLE_OAUTH_FIX.md` for OAuth issues
- Check Railway/Vercel logs for specific errors

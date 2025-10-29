# How to Chat with Real Users (Not Demo Users)

## The Problem
Your messaging page shows "demo users" because you need to create real user accounts first.

## Solution: Create Real User Accounts

### Step 1: Create Your First User
1. Open your app: `https://social-commerce-platform.vercel.app`
2. Click **"Create Account"** button
3. Fill in the form:
   ```
   Username: john_doe
   Display Name: John Doe
   Email: john@example.com
   Password: password123
   ```
4. Click Register
5. You're now logged in as John!

### Step 2: Create a Second User
1. Open a **new incognito/private window** (Ctrl+Shift+N in Chrome)
2. Go to your app again
3. Click **"Create Account"**
4. Fill in different details:
   ```
   Username: jane_smith
   Display Name: Jane Smith
   Email: jane@example.com
   Password: password123
   ```
5. Now you're logged in as Jane!

### Step 3: Start Chatting
1. As **Jane**, click the **Messages** icon (chat bubble) in navigation
2. Click the **"+"** button to start a new chat
3. Search for **"john"** or **"John Doe"**
4. Click on John's profile
5. Type a message: "Hey John!"
6. Click Send

### Step 4: Reply as John
1. Go back to your **first browser window** (where John is logged in)
2. Click the **Messages** icon
3. You should see Jane's message!
4. Type a reply: "Hi Jane!"
5. Click Send

## Why Demo Users Appear

The messaging interface shows demo users as placeholders when:
- No real users are registered in your database
- You're not logged in with a real account
- The backend can't fetch real users

Once you create 2+ real accounts, they will replace the demo users!

## API Endpoints Added

Your backend now has these new endpoints:

### Search Users
```bash
GET /api/auth/users/search?q=john
Authorization: Bearer YOUR_TOKEN
```

Returns users matching the search query.

### Get All Users
```bash
GET /api/auth/users?page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```

Returns all registered users (excluding yourself).

## Testing with Multiple Users

### Create 5 Test Users Quickly

**User 1:**
- Username: alice
- Email: alice@test.com
- Display Name: Alice Johnson

**User 2:**
- Username: bob
- Email: bob@test.com
- Display Name: Bob Wilson

**User 3:**
- Username: charlie
- Email: charlie@test.com
- Display Name: Charlie Brown

**User 4:**
- Username: diana
- Email: diana@test.com
- Display Name: Diana Prince

**User 5:**
- Username: eve
- Email: eve@test.com
- Display Name: Eve Anderson

### Test Messaging Flow

1. **Login as Alice**
   - Open normal browser
   - Login with alice@test.com

2. **Login as Bob**
   - Open incognito window
   - Login with bob@test.com

3. **Alice sends message to Bob**
   - In Alice's window: Messages → + → Search "bob" → Send message

4. **Bob sees and replies**
   - In Bob's window: Messages → See Alice's message → Reply

5. **Real-time chat!**
   - Messages appear instantly
   - No more demo users!

## Current Messaging Features

### ✅ Working Now
- Real user authentication
- User search
- User list (shows all registered users)
- Message UI components
- Conversation management

### ⚠️ Needs Activation
- Real-time message delivery (WebSocket not connected yet)
- Message persistence (no Message model in backend yet)
- Read receipts
- Typing indicators
- Online status

## Quick Fix If Still Seeing Demo Users

1. **Hard refresh** your browser: `Ctrl+Shift+R`
2. **Clear localStorage**: 
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Site Data
   - Reload page
3. **Create fresh user accounts** (not demo login)
4. **Check you're logged in**: Look at top-right avatar/name

## Verifying Real Users

Check your MongoDB database:
```javascript
// In MongoDB Compass or Atlas
use your_database_name;
db.users.find({}).pretty();
```

You should see your registered users there!

## Next Steps

To make messaging fully functional:

1. **Add Socket.IO** for real-time messages
2. **Create Message model** in backend
3. **Add message routes** (POST /api/messages, GET /api/messages/:conversationId)
4. **Connect WebSocket** in frontend

See `REAL_USERS_SETUP.md` for complete messaging setup instructions!

## Troubleshooting

### "No users found"
- Create at least 2 user accounts
- Make sure you're logged in (check token in localStorage)
- Verify backend is deployed

### "Still showing demo users"
- You're using the mock data fallback
- Backend API is not responding
- Check Vercel backend logs

### "Can't create account"
- Check MongoDB connection
- Verify MONGODB_URI environment variable
- Check backend logs for errors

### "Messages not sending"
- WebSocket is not connected yet (expected)
- Follow the full setup in REAL_USERS_SETUP.md

## Summary

**To chat with real users (not demos):**
1. Create 2+ real user accounts via "Create Account"
2. Login with different accounts in different browser windows
3. Click Messages → + → Search for user → Start chat
4. Real users replace demo users automatically!

**Currently:** User accounts and profiles work ✅  
**Next:** Connect real-time messaging (see REAL_USERS_SETUP.md) ⚠️

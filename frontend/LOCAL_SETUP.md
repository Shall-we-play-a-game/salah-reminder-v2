# Local Development Setup Guide

## 🐛 Troubleshooting "mosques.find is not a function" Error

### Problem
You're getting: `Uncaught TypeError: mosques.find is not a function`

### Root Causes & Solutions

#### 1. Missing Environment Variable ✅ **FIXED**

**Problem:** `VITE_BACKEND_URL` not set in your local environment

**Solution:** We added a fallback in the code:
```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mosque-connect-11.preview.emergentagent.com';
```

**But you should still create a `.env` file:**

```bash
# Create .env file in /app/frontend/
cd /app/frontend
cat > .env << 'EOF'
VITE_BACKEND_URL=https://mosque-connect-11.preview.emergentagent.com
EOF
```

#### 2. API Not Responding ✅ **FIXED**

**Problem:** Backend API might not be running or returning errors

**Solution:** Added error handling:
```javascript
// Now catches errors and sets mosques to [] instead of undefined
catch (error) {
  console.error('Error fetching mosques:', error);
  setMosques([]);
  toast.error('Failed to connect to server');
}
```

#### 3. Array Check ✅ **FIXED**

**Problem:** API might return non-array data

**Solution:** Added type checking:
```javascript
const selectedMosqueData = Array.isArray(mosques) 
  ? mosques.find(m => m.id === selectedMosque) 
  : null;
```

## 🚀 Setup Steps for Local Development

### Step 1: Install Dependencies

```bash
cd /app/frontend
yarn install
```

### Step 2: Create Environment File

```bash
# Option 1: Use provided backend
echo "VITE_BACKEND_URL=https://mosque-connect-11.preview.emergentagent.com" > .env

# Option 2: Use local backend
echo "VITE_BACKEND_URL=http://localhost:8001" > .env
```

### Step 3: Start Development Server

```bash
yarn dev
```

Server will start at: `http://localhost:3000`

### Step 4: Verify Backend Connection

Open browser console and check:
```
API URL: https://mosque-connect-11.preview.emergentagent.com/api
```

If you see this, the connection is configured correctly.

## 🔍 Debugging Steps

### Check 1: Backend is Running

```bash
# Test backend API
curl https://mosque-connect-11.preview.emergentagent.com/api/mosques

# Should return JSON array of mosques
```

### Check 2: Environment Variables

```bash
# In your terminal where you run yarn dev
echo $VITE_BACKEND_URL

# OR check in browser console
console.log(import.meta.env.VITE_BACKEND_URL)
```

### Check 3: Network Tab

1. Open DevTools → Network tab
2. Refresh page
3. Look for request to `/api/mosques`
4. Check:
   - Status: Should be 200
   - Response: Should be JSON array
   - If 404/500: Backend issue
   - If CORS error: Backend CORS config

### Check 4: Console Logs

We added debug logging:
```javascript
console.log('API URL:', API);
```

Check browser console for this log.

## 🛠️ Common Issues & Fixes

### Issue 1: CORS Error

**Symptom:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Fix:** Backend needs to allow your origin
```javascript
// Backend should have:
app.use(cors({ origin: '*' }))
```

### Issue 2: Network Error

**Symptom:**
```
Error fetching mosques: Network Error
```

**Causes:**
1. Backend not running
2. Wrong URL in .env
3. Firewall blocking request

**Fix:**
```bash
# Check if backend is running
curl http://localhost:8001/api/

# Check network connectivity
ping mosque-connect-11.preview.emergentagent.com
```

### Issue 3: Invalid Response

**Symptom:**
```
Mosques data is not an array: {...}
```

**Fix:** Backend is returning wrong format. Should return:
```json
[
  { "id": "...", "name": "...", ... },
  { "id": "...", "name": "...", ... }
]
```

### Issue 4: Empty Array

**Symptom:** No mosques showing but no error

**Cause:** Database is empty

**Fix:**
```bash
# Run seed script
cd /app/backend
node seed_data.js
```

## 📝 Environment Variables Reference

### Required Variables

```bash
# Frontend (.env)
VITE_BACKEND_URL=https://mosque-connect-11.preview.emergentagent.com

# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
```

### Optional Variables

```bash
# Frontend
VITE_API_TIMEOUT=10000

# Backend
PORT=8001
CORS_ORIGINS=*
```

## 🧪 Test the Fix

### Manual Test

1. Open `http://localhost:3000`
2. Open Browser DevTools Console
3. You should see:
   ```
   API URL: https://mosque-connect-11.preview.emergentagent.com/api
   ```
4. Page should load without errors
5. Mosques dropdown should be populated

### API Test

```bash
# Test from command line
curl https://mosque-connect-11.preview.emergentagent.com/api/mosques | jq

# Should see:
[
  {
    "id": "...",
    "name": "Al-Noor Mosque",
    "city": "New York",
    ...
  }
]
```

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

### Browser Extensions

- React Developer Tools
- Redux DevTools (if using Redux)
- Axios DevTools

## 📚 Additional Resources

### Check Logs

```bash
# Frontend (in terminal where yarn dev is running)
# Errors will show in terminal

# Backend logs
tail -f /var/log/supervisor/backend.err.log

# MongoDB logs
sudo tail -f /var/log/mongodb.log
```

### Restart Services

```bash
# Restart backend
sudo supervisorctl restart backend

# Restart frontend
sudo supervisorctl restart frontend

# Or manually
cd /app/frontend
yarn dev
```

## ✅ Verification Checklist

- [ ] `.env` file created with `VITE_BACKEND_URL`
- [ ] Dependencies installed (`yarn install`)
- [ ] Dev server running (`yarn dev`)
- [ ] No console errors
- [ ] API URL logged correctly
- [ ] Mosques dropdown populated
- [ ] Prayer times loading
- [ ] No "mosques.find" error

## 🆘 Still Having Issues?

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Clear node_modules**: `rm -rf node_modules && yarn install`
3. **Check backend**: Visit API URL directly in browser
4. **Check network**: Open DevTools Network tab
5. **Check console**: Look for error messages
6. **Restart everything**: Stop both frontend and backend, then start again

---

**All issues should be resolved with the fixes applied! ✅**

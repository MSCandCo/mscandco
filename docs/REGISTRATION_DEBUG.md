# Registration Debugging Guide

## 🔍 **Issue: Generic "Something went wrong" Error**

### **Root Cause**
The frontend was trying to call `/undefined/api/auth/local/register` because the `NEXT_PUBLIC_STRAPI` environment variable was not set.

### **✅ Fixed Issues**

#### **1. Environment Variables**
- **Problem:** Missing `.env.local` file
- **Solution:** Created environment file with correct API URL
- **File:** `audiostems-frontend/.env.local`
```bash
NEXT_PUBLIC_STRAPI=http://localhost:1337
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

#### **2. Enhanced Error Handling**
- **Problem:** Generic error messages
- **Solution:** Improved error parsing and display
- **Changes:** Updated `pages/register.js` with detailed error logging

#### **3. Better Form Validation**
- **Problem:** Basic validation
- **Solution:** Added email format validation and better error messages
- **Features:**
  - Email format validation
  - Password length validation
  - Field-specific error messages

### **🔧 Debugging Steps**

#### **1. Check Environment Variables**
```bash
# Verify .env.local exists
cat audiostems-frontend/.env.local

# Should show:
NEXT_PUBLIC_STRAPI=http://localhost:1337
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

#### **2. Test Backend API**
```bash
# Test registration API directly
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### **3. Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to register a user
4. Look for detailed error logs

#### **4. Check Network Tab**
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to register a user
4. Check the actual API request URL and response

### **🚨 Common Issues & Solutions**

#### **Issue 1: "undefined" in API URL**
- **Symptom:** Network requests to `/undefined/api/...`
- **Cause:** Missing `NEXT_PUBLIC_STRAPI` environment variable
- **Solution:** Create/update `.env.local` file

#### **Issue 2: CORS Errors**
- **Symptom:** CORS policy errors in console
- **Cause:** Frontend and backend on different ports
- **Solution:** Ensure both services are running on correct ports

#### **Issue 3: Validation Errors Not Showing**
- **Symptom:** Generic error message instead of specific validation errors
- **Cause:** Poor error parsing in frontend
- **Solution:** Enhanced error handling (already implemented)

#### **Issue 4: Port Conflicts**
- **Symptom:** Services won't start
- **Solution:** Kill existing processes
```bash
lsof -ti:1337 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### **✅ Current Status**

- ✅ **Backend API:** Working correctly
- ✅ **Frontend Environment:** Configured properly
- ✅ **Error Handling:** Enhanced with detailed logging
- ✅ **Form Validation:** Improved with field-specific errors
- ✅ **Registration Flow:** Functional

### **🎯 Testing Registration**

1. **Visit:** http://localhost:3000/register
2. **Fill out form:**
   - First Name: Test
   - Email: test@example.com
   - Password: password123
3. **Check browser console** for detailed logs
4. **Verify success** or check specific error messages

### **📝 Error Messages Reference**

| Error Type | Message | Solution |
|------------|---------|----------|
| Email already exists | "Email already taken" | Use different email |
| Invalid email format | "Please enter a valid email address" | Check email format |
| Password too short | "Password should be at least 6 characters" | Use longer password |
| Network error | "Network Error" | Check if backend is running |
| API not found | "Request failed with status code 404" | Check API URL configuration |

### **🔧 Development Commands**

```bash
# Start both services
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only  
npm run dev:frontend

# Check service status
npm run status
``` 
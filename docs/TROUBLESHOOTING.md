# Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Port Conflicts

**Problem:** Services won't start due to port conflicts
```
Error: The port 1337 is already used by another application.
```

**Solution:**
```bash
# Kill processes using the ports
lsof -ti:1337 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or restart your computer
```

### Missing package.json

**Problem:** npm commands fail from root directory
```
npm error enoent Could not read package.json
```

**Solution:**
```bash
# Always run from the correct directory
cd audiostems-backend && npm run develop
cd audiostems-frontend && npm run dev

# Or use the unified commands
npm run dev:backend
npm run dev:frontend
npm run dev  # Both services
```

### Missing Dependencies

**Problem:** "command not found" errors
```
sh: next: command not found
```

**Solution:**
```bash
# Install all dependencies
npm run setup

# Or install individually
cd audiostems-frontend && npm install
cd audiostems-backend && npm install
```

### Database Connection Issues

**Problem:** Strapi can't connect to database
```
AggregateError [ECONNREFUSED]
```

**Solution:**
1. Check if database is running
2. Verify connection settings in `config/database.js`
3. For local development, ensure SQLite file exists

### Frontend Build Issues

**Problem:** Next.js build fails
```
Module not found: Can't resolve 'next'
```

**Solution:**
```bash
cd audiostems-frontend
npm install next@latest
npm run dev
```

### AWS Infrastructure Issues

**Problem:** Terraform deployment fails
```
Error: InvalidParameterValue: The parameter group family aurora-postgresql15.4 does not support the instance class db.t3.micro
```

**Solution:**
```bash
# Update instance class in terraform.tfvars
instance_class = "db.r6g.large"
```

## 🔧 Development Commands

### Quick Start
```bash
# Install everything
npm run setup

# Start both services
npm run dev

# Check status
npm run status
```

### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Clean everything
npm run clean
```

### Database Operations
```bash
# Reset local database
cd audiostems-backend
rm .tmp/data.db
npm run develop
```

### AWS Operations
```bash
# Deploy infrastructure
cd infrastructure/aws/database
terraform apply

# Check AWS resources
aws rds describe-db-clusters
```

## 📊 Monitoring

### Service Health Checks
```bash
# Backend
curl http://localhost:1337/admin

# Frontend
curl http://localhost:3000

# Check all services
npm run status
```

### Logs
```bash
# Backend logs
tail -f audiostems-backend/logs/*.log

# Frontend logs (browser console)
# Open browser dev tools

# AWS logs
aws logs describe-log-groups
```

## 🔐 Environment Variables

### Required Environment Files

**Backend (.env.development)**
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

**Frontend (.env.local)**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
STRAPI_API_URL=http://localhost:1337
```

## 🚀 Performance Issues

### Slow Development Server
```bash
# Clear cache
npm run clean
npm run setup

# Use production build for testing
npm run build
npm run start
```

### Memory Issues
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## 📞 Getting Help

1. **Check the status:** `npm run status`
2. **Review logs:** Check service-specific log files
3. **Restart services:** `npm run clean && npm run setup`
4. **Check AWS:** Verify infrastructure is deployed
5. **Git issues:** `git status` and `git log`

## 🔄 Reset Everything

If all else fails:
```bash
# Clean everything
npm run clean

# Reinstall dependencies
npm run setup

# Restart services
npm run dev

# Check status
npm run status
``` 
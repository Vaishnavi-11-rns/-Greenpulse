# GreenPulse Production Deployment Guide

This guide covers deploying GreenPulse to production without Docker.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Vercel (Frontend)                          │
│  - React + TypeScript                       │
│  - Automatic CI/CD                          │
│  - CDN & Edge Caching                       │
└────────────┬────────────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────────────┐
│  Render.com / Railway (Backend)             │
│  - FastAPI Python                           │
│  - Auto-scaling                             │
│  - Health checks                            │
└────────────┬────────────────────────────────┘
             │ PostgreSQL
             ↓
┌─────────────────────────────────────────────┐
│  Managed PostgreSQL Database                │
│  - Daily backups                            │
│  - Automatic scaling                        │
│  - SSL encryption                           │
└─────────────────────────────────────────────┘
```

## Backend Deployment (Render.com)

### 1. Prepare Backend

Create `render.yaml`:
```yaml
services:
  - type: web
    name: greenpulse-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: greenpulse
          property: connectionString
      - key: SECRET_KEY
        sync: false
      - key: ALLOWED_ORIGINS
        value: https://your-domain.com

  - type: pserv
    name: greenpulse-db
    env: postgres
    plan: starter
    ipAllowList: []
```

### 2. Deploy to Render

1. Push to GitHub
2. Go to https://render.com
3. New → Web Service → Connect GitHub repo
4. Select repository and branch
5. Set:
   - Name: `greenpulse-api`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
6. Add Environment Variables:
   - `DATABASE_URL`: (Render provides this from PostgreSQL service)
   - `SECRET_KEY`: (Generate strong key)
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.com`
7. Deploy

### 3. Configure PostgreSQL on Render

1. Go to Render Dashboard
2. New → PostgreSQL
3. Set:
   - Name: `greenpulse-db`
   - Plan: Starter
4. Create
5. Copy connection string to backend env vars

---

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  },
  "routes": [
    { "src": "/.*", "destination": "/index.html" }
  ]
}
```

### 2. Deploy to Vercel

1. Push to GitHub
2. Go to https://vercel.com
3. New Project → Import Git Repository
4. Select your GreenPulse repo
5. Framework Preset: `Vite`
6. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Environment Variables:
   - `VITE_API_URL`: `https://your-backend-domain.com`
8. Deploy

---

## Production Setup Steps

### Step 1: Set Up Database

Use Render, Railway, or AWS RDS managed PostgreSQL:

```sql
-- Backend will auto-create tables via SQLAlchemy
-- But you can pre-create database:
CREATE DATABASE greenpulse_db;
CREATE USER greenpulse WITH PASSWORD '...';
GRANT ALL PRIVILEGES ON DATABASE greenpulse_db TO greenpulse;
```

### Step 2: Generate Secret Key

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Use this for `SECRET_KEY` environment variable.

### Step 3: Backend Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/greenpulse_db
SECRET_KEY=<generated-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://your-frontend-domain.com
PAIRING_CODE_EXPIRY_MINUTES=10
DEFAULT_CARBON_INTENSITY=0.3
```

### Step 4: Frontend Environment Variables

```
VITE_API_URL=https://your-backend-domain.com
```

### Step 5: Monitoring Agent Configuration

Users running the agent need:

```bash
export GREENPULSE_API_URL=https://your-backend-domain.com
python agent.py
```

---

## SSL/TLS Certificates

Both Render and Vercel provide automatic SSL certificates. HTTPS is enabled by default.

---

## Database Backups

### Render PostgreSQL
- Automatic daily backups
- Retention: 7 days (Starter), 90 days (Standard+)
- Manual backups available

### Railway PostgreSQL
- Automatic backups enabled
- Point-in-time recovery
- Manual backups available

---

## Monitoring & Logging

### Backend Logs
Available in Render/Railway dashboards:
- Application output
- Error logs
- Performance metrics

### Frontend Monitoring
Use Vercel's Analytics:
- Build times
- Deployment history
- Performance metrics

---

## Scaling

### Backend
- Render auto-scales based on CPU/Memory
- Adjust plan for more resources
- Configure environment-based scaling

### Database
- Render/Railway handle scaling automatically
- Upgrade plan for more storage
- Read replicas available on higher tiers

### Frontend
- Vercel handles CDN globally
- No scaling needed (serverless)

---

## Performance Optimization

### Backend
```python
# Use connection pooling (default in SQLAlchemy)
# Enable async operations for I/O
# Cache frequently accessed data
```

### Frontend
- Already optimized with Vite
- Enable Gzip compression
- Use production builds only

### Database
- Indexes on frequently queried columns (done in models)
- Connection pooling
- Query optimization

---

## Security Checklist

- [x] Use environment variables for secrets
- [x] Enable HTTPS (automatic)
- [x] Set up CORS properly
- [x] Hash passwords (bcrypt)
- [x] Use JWT with short expiry
- [x] Validate all inputs (Pydantic)
- [x] SQL injection protection (ORM)
- [ ] Set up Web Application Firewall (optional)
- [ ] Enable rate limiting (optional)
- [ ] Set up monitoring/alerting

---

## Cost Estimates (Monthly)

### Render
- Web Service (Free/Starter): $7-50
- PostgreSQL (Starter): $15
- Total: $22-65/month

### Railway
- Backend usage: $5-20
- PostgreSQL: $10-30
- Total: $15-50/month

### Vercel
- Pro plan (optional): $20
- Free tier sufficient for most cases
- Total: $0-20/month

**Total: ~$40-100/month for small-medium deployment**

---

## Troubleshooting Production

### API Returns 500 Errors
- Check backend logs on Render/Railway
- Verify database connection
- Check environment variables

### Frontend Can't Connect to API
- Verify `VITE_API_URL` is correct
- Check CORS is enabled
- Verify backend is running

### Database Connection Fails
- Check `DATABASE_URL` format
- Verify database credentials
- Ensure IP whitelist allows backend

### Agent Can't Connect
- Verify API URL is correct
- Check network connectivity
- Verify SSL certificates (if applicable)

---

## Rollback Procedure

### Backend Rollback
1. Go to Render Dashboard
2. Select deployment
3. Click "Rollback" next to previous version
4. Confirm

### Frontend Rollback
1. Go to Vercel Dashboard
2. Select deployment
3. Click "Promote to Production" on previous version

---

## Maintenance

### Regular Tasks
- Monitor error logs
- Check database size
- Review performance metrics
- Update dependencies quarterly
- Rotate secrets periodically

### Database Maintenance
```bash
# Via psql:
VACUUM ANALYZE;  -- Optimize tables
```

---

## Support

For deployment issues:
- Check Render/Vercel documentation
- Review backend logs
- Contact support@greenpulse.io

---

**Deploy with confidence. Monitor securely. Compute greener.** 🌿

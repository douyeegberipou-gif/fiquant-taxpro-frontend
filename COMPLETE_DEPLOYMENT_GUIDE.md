# 🚀 Complete Deployment Guide - Fiquant TaxPro

## Overview
This guide will help you deploy your Fiquant TaxPro application with:
- **Frontend**: Vercel (React app)
- **Backend**: Render.com (FastAPI Python)
- **Database**: MongoDB Atlas (Cloud MongoDB)

---

## Part 1: MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a **FREE account**
3. Create a new project named "Fiquant TaxPro"

### Step 2: Create Database Cluster
1. Click **"Build a Database"**
2. Choose **FREE Tier** (M0 Sandbox)
3. **Cloud Provider**: AWS
4. **Region**: Choose closest to your users (e.g., Frankfurt or London for Nigeria)
5. **Cluster Name**: `fiquant-cluster`
6. Click **"Create"**

### Step 3: Configure Database Access
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `fiquant_admin`
5. **Password**: Generate a secure password (SAVE THIS!)
6. **Database User Privileges**: Select **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
   - *Note: This is necessary for Render to access your database*
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. **Driver**: Python, **Version**: 3.12 or later
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://fiquant_admin:<password>@fiquant-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database password
7. **SAVE THIS CONNECTION STRING** - you'll need it for Render

**Example Connection String:**
```
mongodb+srv://fiquant_admin:YourSecurePassword123@fiquant-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
```

---

## Part 2: Backend Deployment (Render.com)

### Step 1: Prepare Your GitHub Repository
Ensure your backend code is in a GitHub repository with this structure:
```
your-repo/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── security/
│   └── ...
├── frontend/
│   └── ...
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. **Service Name**: `fiquant-backend` (or your choice)
4. **Region**: Choose closest to Nigeria (e.g., Frankfurt)
5. **Branch**: `main` (or your default branch)

### Step 4: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

### Step 5: Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

| Variable Name | Value | Where to Get It |
|---------------|-------|-----------------|
| `MONGO_URL` | Your MongoDB connection string from Step 1.5 | MongoDB Atlas |
| `DB_NAME` | `fiquant_production` | Choose any name |
| `JWT_SECRET` | Generate a secure random string (32+ characters) | Use: https://randomkeygen.com/ |
| `CORS_ORIGINS` | `*` | For now, allow all origins |
| `FRONTEND_URL` | `https://www.fiquanttaxpro.com` | Your Vercel domain |

**Example Environment Variables:**
```bash
MONGO_URL=mongodb+srv://fiquant_admin:YourPassword@fiquant-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
DB_NAME=fiquant_production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-2024-fiquant-secure
CORS_ORIGINS=*
FRONTEND_URL=https://www.fiquanttaxpro.com
```

### Step 6: Choose Instance Type
- **Free Tier**: Limited hours per month, spins down after inactivity (15 min startup)
- **Starter ($7/month)**: Recommended for production - always on

### Step 7: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. **SAVE YOUR BACKEND URL** - it will look like:
   ```
   https://fiquant-backend.onrender.com
   ```

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Ensure Files Are Ready in GitHub

Your `frontend/` directory should have:
- ✅ `package.json` (with `"homepage": "."`)
- ✅ `vercel.json` (created earlier)
- ✅ All source code in `src/`
- ✅ `.gitignore` (includes `node_modules`, `build`)

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Import Project
1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository** → Select your repository
3. Click **"Import"**

### Step 4: Configure Project Settings

**Framework Preset:**
```
Create React App
```

**Root Directory:**
```
frontend
```

**Build Command:**
```
yarn build
```

**Output Directory:**
```
build
```

**Install Command:**
```
yarn install
```

### Step 5: Configure Environment Variables

Click **"Environment Variables"** and add:

| Variable Name | Value | For Which Environments |
|---------------|-------|------------------------|
| `REACT_APP_BACKEND_URL` | Your Render backend URL (from Part 2, Step 7) | Production, Preview, Development |

**Example:**
```bash
REACT_APP_BACKEND_URL=https://fiquant-backend.onrender.com
```

**Important:** Do NOT include `/api` at the end - your code already adds it.

### Step 6: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. **Your site will be live at**: `https://your-project.vercel.app`

### Step 7: Add Custom Domain (Optional)
1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `www.fiquanttaxpro.com`)
3. Follow Vercel's DNS configuration instructions

---

## Part 4: Update Backend CORS Settings

Once your Vercel deployment is live:

1. Go back to **Render Dashboard**
2. Open your backend service
3. Go to **Environment**
4. Update `CORS_ORIGINS` to your actual domain:
   ```
   https://www.fiquanttaxpro.com,https://your-project.vercel.app
   ```
5. Save and redeploy

---

## Part 5: Email Configuration (Namecheap SMTP)

Your backend is already configured with hardcoded Namecheap SMTP credentials in `server.py`.

**Verify in server.py around line 3800:**
```python
MOCK_INTEGRATIONS = {
    "communications": {
        "namecheap": {
            "config": {
                "smtp_host": "mail.privateemail.com",
                "smtp_port": "465",
                "from_email": "info@fiquanttaxpro.com",
                "smtp_username": "info@fiquanttaxpro.com",
                "smtp_password": "Generaldee1"
            }
        }
    }
}
```

✅ **This is already set up** - no action needed unless you want to change credentials.

---

## Part 6: Testing Your Deployment

### Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
```

Should return: `{"status": "ok"}`

### Test Frontend
1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for errors
4. Verify no "import.meta" errors
5. Check that JavaScript files load correctly

### Test Full Flow
1. Try to register a new user
2. Check email for verification link
3. Verify email
4. Login
5. Use a calculator

---

## Part 7: Monitoring & Maintenance

### Render (Backend)
- **Logs**: Dashboard → Your Service → **Logs** tab
- **Metrics**: Dashboard → Your Service → **Metrics** tab
- **Health**: Monitor uptime and response times

### Vercel (Frontend)
- **Deployments**: Track all deployments
- **Analytics**: View visitor metrics (Pro plan)
- **Logs**: Real-time function logs

### MongoDB Atlas
- **Metrics**: Database performance
- **Backups**: Automatic daily backups (Free tier)
- **Alerts**: Set up email alerts for issues

---

## Part 8: Important Security Notes

### ⚠️ Production Checklist:

1. **Change JWT_SECRET**: Use a strong, random 32+ character string
2. **Restrict CORS**: Update `CORS_ORIGINS` to only your domains
3. **Database Password**: Use a strong, unique password
4. **Email Credentials**: Consider moving SMTP credentials to environment variables
5. **API Keys**: Never commit API keys to GitHub
6. **MongoDB Network**: Restrict IP access if possible

---

## Part 9: Cost Summary

### Free Tier (Testing):
- MongoDB Atlas: **FREE** (512MB storage)
- Render: **FREE** (750 hours/month, sleeps after inactivity)
- Vercel: **FREE** (Unlimited static sites)
- **Total: $0/month**

### Production Tier:
- MongoDB Atlas: **FREE** (M0 tier sufficient for MVP)
- Render Starter: **$7/month** (always-on, faster)
- Vercel: **FREE** (upgrade to Pro $20/month for analytics)
- **Total: $7-27/month**

---

## Part 10: Troubleshooting

### Backend Won't Start on Render
- Check **Logs** tab for Python errors
- Verify `requirements.txt` has all dependencies
- Ensure `MONGO_URL` is correct

### Frontend Shows Blank Page
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Force redeploy without cache on Vercel

### Database Connection Errors
- Verify MongoDB password is correct
- Check that IP address `0.0.0.0/0` is whitelisted
- Ensure connection string has no spaces

### Email Not Sending
- Verify SMTP credentials in server.py
- Check Render logs for email errors
- Test SMTP settings using a tool like SMTP2GO

---

## 🎉 Deployment Complete!

Your Fiquant TaxPro application should now be fully deployed and accessible worldwide!

**Next Steps:**
1. Test all features thoroughly
2. Monitor logs for any errors
3. Set up analytics
4. Share with users
5. Gather feedback

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://www.mongodb.com/docs/atlas/

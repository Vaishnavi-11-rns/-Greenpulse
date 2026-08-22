# GreenPulse Complete Installation Guide

## System Requirements

### Hardware
- Minimum 2GB RAM
- 500MB disk space
- Any modern CPU (Intel, AMD, Apple Silicon)
- GPU optional (for GPU metrics)

### Software
- **Python 3.12+** (backend & agent)
- **Node.js 18+** (frontend)
- **PostgreSQL 14+** (database)
- **Git** (for cloning)

### Operating Systems
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+, Fedora 30+, etc.)

---

## Step 1: Install Dependencies

### Windows

```powershell
# Install Python
# Download from https://www.python.org/downloads/
# Make sure to check "Add Python to PATH"

# Install Node.js
# Download from https://nodejs.org/
# Use LTS version

# Install PostgreSQL
# Download from https://www.postgresql.org/download/windows/
# Remember the password you set for postgres user
```

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python, Node.js, PostgreSQL
brew install python@3.12 node postgresql

# Start PostgreSQL
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
# Update package manager
sudo apt update
sudo apt upgrade

# Install Python, Node.js, PostgreSQL
sudo apt install python3.12 python3-pip nodejs postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Step 2: Clone & Extract GreenPulse

```bash
# Extract the zip file
unzip greenpulse.zip
cd greenpulse

# Or clone from GitHub (if using git)
git clone https://github.com/yourusername/greenpulse.git
cd greenpulse
```

---

## Step 3: Set Up Database

### Windows (Command Prompt)

```cmd
# Connect to PostgreSQL
psql -U postgres

# Then run these SQL commands:
CREATE DATABASE greenpulse_db;
CREATE USER greenpulse WITH PASSWORD 'greenpulse';
ALTER USER greenpulse CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE greenpulse_db TO greenpulse;
\q
```

### macOS/Linux

```bash
# Connect to PostgreSQL
psql postgres

# Then run these SQL commands:
CREATE DATABASE greenpulse_db;
CREATE USER greenpulse WITH PASSWORD 'greenpulse';
ALTER USER greenpulse CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE greenpulse_db TO greenpulse;
\q
```

---

## Step 4: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Important: Set DATABASE_URL, SECRET_KEY, ALLOWED_ORIGINS
```

### Sample .env file:

```
DATABASE_URL=postgresql://greenpulse:greenpulse@localhost:5432/greenpulse_db
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
PAIRING_CODE_EXPIRY_MINUTES=10
DEFAULT_CARBON_INTENSITY=0.3
```

### Start Backend

```bash
# Still in backend directory with venv activated
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use gunicorn for production:
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

✅ Backend will be available at: `http://localhost:8000`

API Docs: `http://localhost:8000/docs`

---

## Step 5: Frontend Setup

Open a NEW terminal (keep backend running):

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env.local

# Edit .env.local if needed (default should work)
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

✅ Frontend will be available at: `http://localhost:5173`

---

## Step 6: Monitoring Agent Setup

Open a NEW terminal (keep backend and frontend running):

```bash
cd monitoring-agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the agent
# On Windows:
set GREENPULSE_API_URL=http://localhost:8000
# On macOS/Linux:
export GREENPULSE_API_URL=http://localhost:8000

python agent.py
```

The agent will prompt you for a pairing code.

---

## Step 7: Using GreenPulse

### 1. Access the Web Application

Open browser and go to: `http://localhost:5173`

### 2. Register Account

- Click "Get Started"
- Fill in email, password, and full name
- Click "Create Account"

### 3. Login

- Enter your credentials
- Click "Sign In"

### 4. Connect Your Laptop

- Click "Connect This Laptop" on dashboard
- Click "Generate Pairing Code"
- Copy the displayed code

### 5. Run Monitoring Agent

- In monitoring agent terminal, paste the pairing code when prompted
- Agent will connect and start sending telemetry
- Dashboard will show real metrics

### 6. View Dashboard

- Metrics update in real-time
- Charts show historical data
- Try different features:
  - View daily/weekly analytics
  - Check device management
  - See carbon-aware scheduler
  - Use what-if simulator

---

## Running All Services Together

### Quick Start Script (macOS/Linux)

```bash
chmod +x start-local.sh
./start-local.sh
```

This will start all three services automatically.

### Manual (All Platforms)

Terminal 1 - Backend:
```bash
cd backend && source venv/bin/activate && python -m uvicorn main:app --reload
```

Terminal 2 - Frontend:
```bash
cd frontend && npm run dev
```

Terminal 3 - Agent:
```bash
cd monitoring-agent && source venv/bin/activate && python agent.py
```

---

## Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database `greenpulse_db` exists
- [ ] Backend starts without errors
- [ ] Frontend accessible at localhost:5173
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can generate pairing code
- [ ] Agent connects successfully
- [ ] Real telemetry appears on dashboard
- [ ] Charts display data

---

## Troubleshooting

### "PostgreSQL connection refused"

```bash
# Check if PostgreSQL is running
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Verify connection string in .env
DATABASE_URL=postgresql://greenpulse:greenpulse@localhost:5432/greenpulse_db
```

### "Port 8000 already in use"

```bash
# Use different port:
python -m uvicorn main:app --port 8001

# Update frontend VITE_API_URL to http://localhost:8001
```

### "ModuleNotFoundError" in backend

```bash
# Make sure virtual environment is activated
# And dependencies are installed
pip install -r requirements.txt
```

### "npm: command not found"

```bash
# Node.js not installed
# Visit https://nodejs.org/ and install LTS version
# Restart terminal after installation
```

### "Cannot connect to pairing code"

- Verify backend is running (`http://localhost:8000/health`)
- Check GREENPULSE_API_URL is set correctly
- Ensure pairing code hasn't expired (10 minutes)
- Try generating new code

---

## Environment Variables Reference

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://... | PostgreSQL connection |
| SECRET_KEY | - | JWT secret (must set in production) |
| ALGORITHM | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Token expiration |
| ALLOWED_ORIGINS | localhost:* | CORS allowed origins |
| PAIRING_CODE_EXPIRY_MINUTES | 10 | Pairing code validity |
| DEFAULT_CARBON_INTENSITY | 0.3 | Default grid carbon intensity |

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8000 | Backend API URL |

### Agent

| Variable | Default | Description |
|----------|---------|-------------|
| GREENPULSE_API_URL | http://localhost:8000 | Backend API URL |

---

## Testing

### Run End-to-End Tests

```bash
chmod +x test-e2e.sh
./test-e2e.sh
```

This tests:
- User registration
- User login
- Device pairing
- Telemetry submission
- Data retrieval
- All major endpoints

---

## Production Deployment

See `DEPLOYMENT.md` for deploying to:
- Render.com
- Railway.app
- Vercel
- Self-hosted servers

---

## Common Commands

### Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run in development
python -m uvicorn main:app --reload

# Run in production
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# Create database tables
python -c "from database import init_db; init_db()"

# Access PostgreSQL directly
psql -U greenpulse -d greenpulse_db
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Monitoring Agent

```bash
cd monitoring-agent
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run agent
python agent.py

# With custom API URL
export GREENPULSE_API_URL=http://192.168.1.100:8000
python agent.py
```

---

## File Structure After Setup

```
greenpulse/
├── backend/
│   ├── venv/                 # Virtual environment (created)
│   ├── main.py
│   ├── models.py
│   ├── .env                  # Your configuration (created)
│   └── ...
├── frontend/
│   ├── node_modules/         # Dependencies (created)
│   ├── src/
│   ├── .env.local            # Your configuration (created)
│   └── ...
├── monitoring-agent/
│   ├── venv/                 # Virtual environment (created)
│   ├── agent.py
│   └── ...
└── README.md
```

---

## Security Notes

### Development (localhost only)

⚠️ The default configuration is for development only.

- SECRET_KEY should be changed
- ALLOWED_ORIGINS limited to localhost
- Database on local machine

### Production

See `DEPLOYMENT.md` for security setup:

- Generate strong SECRET_KEY
- Use environment variables for all secrets
- Enable HTTPS/SSL
- Set proper ALLOWED_ORIGINS
- Use managed database service
- Enable CORS only for your domain

---

## Getting Help

1. **Check logs**: Look at terminal output for errors
2. **Read README.md**: Quick overview and architecture
3. **Check DEPLOYMENT.md**: For production issues
4. **API Docs**: http://localhost:8000/docs (Swagger)
5. **GitHub Issues**: Report bugs and ask questions

---

## Performance Tips

### Backend
- Use production database (managed PostgreSQL)
- Enable connection pooling
- Use gunicorn with multiple workers
- Enable caching for frequent queries

### Frontend
- Use production build (`npm run build`)
- Deploy to CDN (Vercel, Netlify)
- Enable gzip compression
- Minimize JavaScript bundle

### Agent
- Run on dedicated machine/laptop
- Monitor resource usage
- Adjust polling interval as needed
- Keep system libraries updated

---

## Next Steps

1. ✅ Complete local setup (you are here)
2. 📊 Explore the dashboard
3. 🚀 Deploy to production (see DEPLOYMENT.md)
4. 🔧 Customize for your needs
5. 📱 Create mobile app (optional)
6. 🤖 Add AI features (ML models ready)

---

**GreenPulse is ready to use!** 🌿

Start computing greener today.

# GreenPulse: AI-Powered Carbon-Aware Computing Assistant

GreenPulse is a production-quality full-stack application that monitors laptop resource usage and calculates carbon emissions in real-time.

## Project Structure

```
greenpulse/
├── frontend/          # React + TypeScript + Vite web application
├── backend/           # FastAPI Python backend
├── monitoring-agent/  # Python monitoring agent (runs on laptop)
└── README.md
```

## Features

- ✅ **Real-time Monitoring**: CPU, GPU, RAM, Battery monitoring
- ✅ **Carbon Estimation**: Calculate CO₂e emissions from power consumption
- ✅ **Secure Device Pairing**: Pairing codes for secure device connection
- ✅ **JWT Authentication**: Secure user authentication
- ✅ **Historical Analytics**: Track usage patterns over time
- ✅ **Premium UI/UX**: Modern, responsive design with Tailwind CSS

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Set up PostgreSQL**:
```bash
# Create database and user
createdb greenpulse_db
createuser -P greenpulse  # Password: greenpulse
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run backend**:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local if needed
```

3. **Run frontend**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Monitoring Agent Setup

1. **Install dependencies**:
```bash
cd monitoring-agent
pip install -r requirements.txt
```

2. **Run agent**:
```bash
# Set backend URL
export GREENPULSE_API_URL=http://localhost:8000

python agent.py
```

The agent will prompt you to enter a pairing code from your dashboard.

## Workflow

1. **User registers/logs in** on the frontend
2. **User requests pairing code** from dashboard
3. **User runs monitoring agent** with the pairing code
4. **Agent authenticates** with backend
5. **Agent sends real telemetry** every 5 seconds
6. **Dashboard displays** real-time metrics and analytics

## Architecture

```
┌─────────────────────────────────────────┐
│      React Frontend (Web Dashboard)     │
│  - User Auth (Login/Register)           │
│  - Device Management                    │
│  - Real-time Charts & Analytics         │
│  - Pairing Code Generation              │
└──────────────┬──────────────────────────┘
               │ (HTTP/REST API)
               ↓
┌─────────────────────────────────────────┐
│        FastAPI Backend                  │
│  - Authentication & JWT                 │
│  - Device Pairing & Management          │
│  - Telemetry Storage                    │
│  - Analytics & Predictions              │
│  - Carbon Calculations                  │
└──────────────┬──────────────────────────┘
               │ (SQL)
               ↓
┌─────────────────────────────────────────┐
│        PostgreSQL Database              │
│  - Users                                │
│  - Devices                              │
│  - Telemetry Streams                    │
│  - Analytics Data                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Monitoring Agent (On User Laptop)     │
│  - Collects real CPU/RAM/GPU/Battery    │
│  - Estimates Power Consumption          │
│  - Sends telemetry to Backend           │
│  - Runs with minimal resource impact    │
└──────────────┬──────────────────────────┘
               │ (HTTPS/REST API)
               ↓
        (To Backend above)
```

## Deployment

### Backend Deployment (Render/Railway/Fly.io)

1. **Configure environment variables**:
   - DATABASE_URL (managed PostgreSQL)
   - SECRET_KEY (production secret)
   - ALLOWED_ORIGINS (production domain)

2. **Deploy**:
```bash
# Render.com example
git push origin main
# Auto-deploys from Git
```

### Frontend Deployment (Vercel)

1. **Configure environment**:
```
VITE_API_URL=https://your-backend-domain.com
```

2. **Deploy**:
```bash
npm run build
# Vercel auto-deploys from Git
```

### Database

Use managed PostgreSQL services:
- Render PostgreSQL
- Railway PostgreSQL
- AWS RDS
- DigitalOcean Managed PostgreSQL

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

### Devices
- `GET /devices` - List user's devices
- `POST /devices` - Create device
- `PUT /devices/{id}` - Update device
- `DELETE /devices/{id}` - Delete device

### Device Pairing
- `POST /pairing/request-code` - Generate pairing code
- `POST /pairing/confirm` - Confirm device pairing

### Telemetry
- `POST /monitor/telemetry` - Submit telemetry
- `GET /monitor/current` - Get current telemetry
- `GET /monitor/history` - Get telemetry history

### Analytics
- `GET /analytics/daily` - Daily analytics
- `GET /predictions` - AI predictions
- `GET /anomalies` - Detected anomalies
- `GET /recommendations` - Personalized recommendations
- `GET /alerts` - User alerts

See full API docs at `/docs` endpoint on backend.

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Development

### Backend Development
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Monitoring Agent Development
```bash
cd monitoring-agent
python agent.py
```

## Database Migrations

When models change, apply migrations:

```bash
cd backend
# SQLAlchemy auto-creates tables on startup
python -c "from database import init_db; init_db()"
```

## Troubleshooting

### Backend Won't Connect to Database
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database and user exist

### Frontend Can't Reach Backend
- Check backend is running on port 8000
- Verify VITE_API_URL is correct
- Check CORS is enabled in backend

### Agent Can't Pair
- Verify pairing code is correct
- Check pairing code hasn't expired
- Ensure backend is accessible

### No Telemetry Data
- Confirm agent is running
- Check device is paired
- Verify agent has Bearer token
- Check backend logs for errors

## Performance

- **Frontend**: Lightweight React app ~200KB
- **Backend**: Fast FastAPI with async I/O
- **Agent**: Minimal resource overhead (~1-2% CPU)
- **Database**: Indexed queries for fast analytics

## Security

- ✅ JWT tokens for authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Environment variables for secrets
- ✅ Input validation with Pydantic
- ✅ SQL injection protection via SQLAlchemy ORM

## License

MIT License - See LICENSE file

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: support@greenpulse.io

---

**GreenPulse: Compute Smarter. Breathe Greener.** 🌿

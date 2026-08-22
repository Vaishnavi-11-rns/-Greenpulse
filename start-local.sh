#!/bin/bash

echo "====================================="
echo "GreenPulse Local Development"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if psql -U postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo "  Start PostgreSQL first, then run this script again"
    exit 1
fi

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw greenpulse_db; then
    echo -e "${GREEN}✓ Database 'greenpulse_db' exists${NC}"
else
    echo -e "${YELLOW}Creating database...${NC}"
    createdb greenpulse_db
    createuser -P greenpulse || true
    psql -U postgres -d greenpulse_db -c "GRANT ALL PRIVILEGES ON DATABASE greenpulse_db TO greenpulse;"
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Start backend
echo -e "\n${YELLOW}Starting Backend...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || true
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

# Give backend time to start
sleep 2

# Start frontend
echo -e "\n${YELLOW}Starting Frontend...${NC}"
cd frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

# Start monitoring agent
echo -e "\n${YELLOW}Starting Monitoring Agent...${NC}"
cd monitoring-agent
source venv/bin/activate 2>/dev/null || true
python agent.py > /tmp/agent.log 2>&1 &
AGENT_PID=$!
echo -e "${GREEN}✓ Monitoring Agent started (PID: $AGENT_PID)${NC}"
cd ..

echo -e "\n${GREEN}====================================="
echo "✓ GreenPulse is running!"
echo "====================================="
echo ""
echo -e "${YELLOW}URLs:${NC}"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Processes:${NC}"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo "  Agent PID:    $AGENT_PID"
echo ""
echo -e "${YELLOW}To stop all services:${NC}"
echo "  kill $BACKEND_PID $FRONTEND_PID $AGENT_PID"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Frontend: tail -f /tmp/frontend.log"
echo "  Agent:    tail -f /tmp/agent.log"
echo ""

# Keep script running
wait $BACKEND_PID

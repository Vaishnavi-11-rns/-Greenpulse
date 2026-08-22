#!/bin/bash

echo "====================================="
echo "GreenPulse Development Setup"
echo "====================================="

# Create virtual environments
echo "\n1. Creating Python virtual environments..."
python3 -m venv backend/venv
python3 -m venv monitoring-agent/venv

# Activate and install backend dependencies
echo "\n2. Installing backend dependencies..."
source backend/venv/bin/activate
pip install -q --upgrade pip
pip install -q -r backend/requirements.txt
deactivate

# Activate and install monitoring agent dependencies
echo "\n3. Installing monitoring agent dependencies..."
source monitoring-agent/venv/bin/activate
pip install -q --upgrade pip
pip install -q -r monitoring-agent/requirements.txt
deactivate

# Install frontend dependencies
echo "\n4. Installing frontend dependencies..."
cd frontend
npm install --quiet 2>/dev/null
cd ..

# Create .env files
echo "\n5. Creating environment files..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

echo "\n====================================="
echo "✓ Setup complete!"
echo "====================================="
echo "\nNext steps:"
echo "1. Start PostgreSQL:"
echo "   createdb greenpulse_db"
echo "   createuser -P greenpulse"
echo ""
echo "2. Start backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m uvicorn main:app --reload"
echo ""
echo "3. In another terminal, start frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. In another terminal, start monitoring agent:"
echo "   cd monitoring-agent"
echo "   source venv/bin/activate"
echo "   python agent.py"
echo ""

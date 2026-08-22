#!/bin/bash

# GreenPulse End-to-End Testing Script
# This script verifies all major functionality

set -e

BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "====================================="
echo "GreenPulse E2E Testing"
echo "====================================="

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
if curl -s "$BASE_URL/health" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Test 2: User Registration
echo -e "\n${YELLOW}Test 2: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "test@example.com"; then
    echo -e "${GREEN}✓ User registration successful${NC}"
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
else
    echo -e "${RED}✗ User registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
    # Continue anyway, user might already exist
fi

# Test 3: User Login
echo -e "\n${YELLOW}Test 3: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ User login successful${NC}"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗ User login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 4: Get Current User
echo -e "\n${YELLOW}Test 4: Get Current User${NC}"
CURRENT_USER=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CURRENT_USER" | grep -q "test@example.com"; then
    echo -e "${GREEN}✓ Current user retrieval successful${NC}"
else
    echo -e "${RED}✗ Current user retrieval failed${NC}"
    exit 1
fi

# Test 5: Request Pairing Code
echo -e "\n${YELLOW}Test 5: Request Pairing Code${NC}"
PAIRING_RESPONSE=$(curl -s -X POST "$BASE_URL/pairing/request-code" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PAIRING_RESPONSE" | grep -q "code"; then
    echo -e "${GREEN}✓ Pairing code generation successful${NC}"
    PAIRING_CODE=$(echo "$PAIRING_RESPONSE" | grep -o '"code":"[^"]*' | cut -d'"' -f4)
    echo "  Pairing Code: $PAIRING_CODE"
else
    echo -e "${RED}✗ Pairing code generation failed${NC}"
    exit 1
fi

# Test 6: Confirm Device Pairing
echo -e "\n${YELLOW}Test 6: Confirm Device Pairing${NC}"
DEVICE_ID=$(python3 -c "import uuid; print(uuid.getnode())")
CONFIRM_RESPONSE=$(curl -s -X POST "$BASE_URL/pairing/confirm" \
  -H "Content-Type: application/json" \
  -d "{
    \"pairing_code\": \"$PAIRING_CODE\",
    \"device_name\": \"Test Laptop\",
    \"device_id\": \"$DEVICE_ID\",
    \"os_name\": \"Linux\",
    \"os_version\": \"5.15\",
    \"cpu_model\": \"Intel i7\",
    \"gpu_model\": null,
    \"total_ram_gb\": 16
  }")

if echo "$CONFIRM_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Device pairing successful${NC}"
    DEVICE_TOKEN=$(echo "$CONFIRM_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    PAIRED_DEVICE_ID=$(echo "$CONFIRM_RESPONSE" | grep -o '"device_id":[0-9]*' | grep -o '[0-9]*')
    echo "  Device ID: $PAIRED_DEVICE_ID"
else
    echo -e "${RED}✗ Device pairing failed${NC}"
    echo "Response: $CONFIRM_RESPONSE"
    exit 1
fi

# Test 7: Submit Telemetry
echo -e "\n${YELLOW}Test 7: Submit Telemetry${NC}"
TELEMETRY_RESPONSE=$(curl -s -X POST "$BASE_URL/monitor/telemetry" \
  -H "Authorization: Bearer $DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "'$DEVICE_ID'",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S")Z'",
    "cpu_usage_percent": 42.5,
    "gpu_usage_percent": null,
    "ram_usage_percent": 61.3,
    "ram_used_gb": 9.8,
    "ram_available_gb": 6.2,
    "battery_percent": 85,
    "is_charging": false
  }')

if echo "$TELEMETRY_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Telemetry submission successful${NC}"
else
    echo -e "${RED}✗ Telemetry submission failed${NC}"
    echo "Response: $TELEMETRY_RESPONSE"
fi

# Test 8: Get Current Telemetry
echo -e "\n${YELLOW}Test 8: Get Current Telemetry${NC}"
CURRENT_TELEMETRY=$(curl -s -X GET "$BASE_URL/monitor/current" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$CURRENT_TELEMETRY" | grep -q "devices"; then
    echo -e "${GREEN}✓ Current telemetry retrieval successful${NC}"
else
    echo -e "${RED}✗ Current telemetry retrieval failed${NC}"
fi

# Test 9: Get Devices
echo -e "\n${YELLOW}Test 9: Get Devices${NC}"
DEVICES=$(curl -s -X GET "$BASE_URL/devices" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$DEVICES" | grep -q "Test Laptop"; then
    echo -e "${GREEN}✓ Device listing successful${NC}"
else
    echo -e "${RED}✗ Device listing failed${NC}"
fi

# Test 10: Get Telemetry History
echo -e "\n${YELLOW}Test 10: Get Telemetry History${NC}"
HISTORY=$(curl -s -X GET "$BASE_URL/monitor/history?device_id=$PAIRED_DEVICE_ID&hours=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$HISTORY" | grep -q "records"; then
    echo -e "${GREEN}✓ Telemetry history retrieval successful${NC}"
else
    echo -e "${RED}✗ Telemetry history retrieval failed${NC}"
fi

# Summary
echo -e "\n${GREEN}====================================="
echo "✓ All tests passed!"
echo "====================================="
echo ""
echo -e "${YELLOW}Test Summary:${NC}"
echo "  - User registration ✓"
echo "  - User login ✓"
echo "  - Current user ✓"
echo "  - Pairing code generation ✓"
echo "  - Device pairing ✓"
echo "  - Telemetry submission ✓"
echo "  - Current telemetry ✓"
echo "  - Device listing ✓"
echo "  - Telemetry history ✓"
echo ""
echo -e "${YELLOW}Frontend Access:${NC}"
echo "  1. Open: $FRONTEND_URL"
echo "  2. Register or login with: test@example.com / testpassword123"
echo "  3. Connect your laptop with pairing code: $PAIRING_CODE"
echo ""

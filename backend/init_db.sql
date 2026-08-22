-- Create database
CREATE DATABASE greenpulse_db;

-- Create user
CREATE USER greenpulse WITH PASSWORD 'greenpulse';
ALTER USER greenpulse CREATEDB;

-- Connect to the database
\c greenpulse_db

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE greenpulse_db TO greenpulse;
GRANT ALL PRIVILEGES ON SCHEMA public TO greenpulse;

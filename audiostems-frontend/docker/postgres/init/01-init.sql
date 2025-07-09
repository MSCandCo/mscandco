-- MSC & Co Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE msc_co_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'msc_co_dev')\gexec

-- Create additional databases for different environments
SELECT 'CREATE DATABASE msc_co_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'msc_co_test')\gexec

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE msc_co_dev TO msc_co_user;
GRANT ALL PRIVILEGES ON DATABASE msc_co_test TO msc_co_user;

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'MSC & Co database initialization completed successfully';
END $$; 
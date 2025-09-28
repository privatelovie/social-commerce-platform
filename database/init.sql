-- Create databases for different microservices
CREATE DATABASE user_service_db;
CREATE DATABASE product_service_db;
CREATE DATABASE order_service_db;
CREATE DATABASE social_service_db;
CREATE DATABASE payment_service_db;
CREATE DATABASE notification_service_db;

-- Create users for each service
CREATE USER user_service_user WITH PASSWORD 'user_service_pass';
CREATE USER product_service_user WITH PASSWORD 'product_service_pass';
CREATE USER order_service_user WITH PASSWORD 'order_service_pass';
CREATE USER social_service_user WITH PASSWORD 'social_service_pass';
CREATE USER payment_service_user WITH PASSWORD 'payment_service_pass';
CREATE USER notification_service_user WITH PASSWORD 'notification_service_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE user_service_db TO user_service_user;
GRANT ALL PRIVILEGES ON DATABASE product_service_db TO product_service_user;
GRANT ALL PRIVILEGES ON DATABASE order_service_db TO order_service_user;
GRANT ALL PRIVILEGES ON DATABASE social_service_db TO social_service_user;
GRANT ALL PRIVILEGES ON DATABASE payment_service_db TO payment_service_user;
GRANT ALL PRIVILEGES ON DATABASE notification_service_db TO notification_service_user;

-- Enable necessary extensions
\c user_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c product_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c order_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c social_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c payment_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c notification_service_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
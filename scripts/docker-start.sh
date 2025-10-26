#!/bin/bash
# docker-start.sh - Quick Docker setup script

set -e  # Exit on any error

echo "🐳 Starting Docker setup for Social Commerce AI Platform..."

# Check if Docker is installed and running
echo "📋 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

echo "✅ Docker check passed"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose check passed"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your actual environment variables"
    else
        echo "❌ No .env.example file found. Creating a basic .env file..."
        cat > .env << 'EOL'
# Database
MONGODB_PASSWORD=admin123

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# APIs (add your actual keys)
OPENAI_API_KEY=sk-your-openai-api-key-here
STRIPE_SECRET_KEY=sk_your_stripe_secret_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOL
        echo "⚠️  Created basic .env file. Please edit it with your actual values."
    fi
else
    echo "✅ .env file already exists"
fi

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Build and start services
echo "🏗️ Building Docker images..."
if docker-compose -f docker-compose.production.yml build; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo "🚀 Starting services..."
if docker-compose -f docker-compose.production.yml up -d; then
    echo "✅ Services started successfully"
else
    echo "❌ Failed to start services"
    exit 1
fi

# Wait a moment for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check if services are running
if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "⚠️  Some services might not be running properly"
fi

echo ""
echo "🎉 Docker setup completed!"
echo ""
echo "📍 Your application should be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   MongoDB: mongodb://localhost:27017"
echo "   Redis: redis://localhost:6379"
echo ""
echo "📊 Useful commands:"
echo "   View logs:        docker-compose -f docker-compose.production.yml logs -f"
echo "   Stop services:    docker-compose -f docker-compose.production.yml down"
echo "   Restart service:  docker-compose -f docker-compose.production.yml restart <service>"
echo "   View status:      docker-compose -f docker-compose.production.yml ps"
echo ""
echo "🔧 Troubleshooting:"
echo "   If services fail to start, check the logs and ensure .env is configured properly"
# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a next-generation AI-driven social e-commerce platform that combines Amazon-style shopping with Twitter-like social interactions. The platform uses a microservices architecture with separate Django backend services, FastAPI AI/ML services, and a React TypeScript frontend.

## Architecture

The platform follows a microservices architecture with:

### Backend Services (Django + DRF)
- **user-service** (Port 8000): User management, authentication, profiles, and social following
- **product-service** (Port 8001): Product catalog, categories, reviews, and inventory
- **order-service** (Port 8002): Order processing and fulfillment
- **social-service** (Port 8003): Social feeds, posts, comments, hashtags
- **payment-service** (Port 8004): Payment processing with Stripe integration
- **notification-service** (Port 8005): Push notifications and alerts
- **api-gateway** (Port 8080): Central API gateway and routing

### AI/ML Services (FastAPI)
- **recommendation-engine** (Port 8001): Collaborative filtering and content-based recommendations
- **search-service** (Port 8006): Elasticsearch-powered intelligent search
- **chatbot-service** (Port 8007): AI customer support
- **fraud-detection** (Port 8008): Transaction security analysis

### Frontend
- **React 18 + TypeScript** application (Port 3000)
- **Material-UI** components, **Redux Toolkit** state management
- **Socket.io** for real-time features

### Infrastructure
- **PostgreSQL 15** with separate databases per microservice
- **Redis** for caching and session management
- **Elasticsearch 8.8** for search functionality
- **Kibana** for monitoring and analytics

## Common Development Commands

### Full Stack Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f user-service

# Stop all services
docker-compose down

# Rebuild and restart services
docker-compose up -d --build
```

### Database Operations

```bash
# Run migrations for all Django services
docker-compose exec user-service python manage.py migrate
docker-compose exec product-service python manage.py migrate
docker-compose exec order-service python manage.py migrate
docker-compose exec social-service python manage.py migrate
docker-compose exec payment-service python manage.py migrate
docker-compose exec notification-service python manage.py migrate

# Create Django superuser
docker-compose exec user-service python manage.py createsuperuser

# Reset database (WARNING: destroys all data)
docker-compose down -v
docker-compose up -d
```

### Frontend Development

```bash
# Run frontend in development mode
cd frontend
npm install
npm start

# Run frontend tests
npm test

# Build for production
npm run build
```

### Backend Service Development

```bash
# Run individual Django service locally
cd backend/user-service
pip install -r ../requirements.txt
python manage.py runserver 8000

# Run Django tests for a service
docker-compose exec user-service python manage.py test

# Django shell access
docker-compose exec user-service python manage.py shell
```

### AI Service Development

```bash
# Run AI service locally
cd ai-services/recommendation-engine
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8001

# Run AI service tests
cd ai-services/recommendation-engine
pytest
```

### Testing

```bash
# Run all backend tests
docker-compose exec user-service python manage.py test
docker-compose exec product-service python manage.py test
docker-compose exec order-service python manage.py test
docker-compose exec social-service python manage.py test
docker-compose exec payment-service python manage.py test
docker-compose exec notification-service python manage.py test

# Run frontend tests
cd frontend && npm test

# Run AI service tests
cd ai-services/recommendation-engine && pytest
cd ai-services/search-service && pytest
cd ai-services/chatbot-service && pytest
cd ai-services/fraud-detection && pytest
```

## Key Architecture Patterns

### Database Design
Each Django service has its own PostgreSQL database following the database-per-service pattern. The User model uses UUIDs as primary keys and includes extensive social commerce features like follower/following relationships, seller status, and privacy settings.

### AI/ML Integration
AI services are built with FastAPI and integrate with the Django backend through HTTP APIs. The recommendation engine implements collaborative filtering, content-based filtering, and social recommendations with Redis caching for performance.

### Real-time Features
Socket.io handles real-time features like chat, notifications, and live updates. Django Channels provides WebSocket support for the backend services.

### Microservice Communication
Services communicate via HTTP REST APIs through the API gateway. Redis is used for caching and cross-service data sharing. Each service has its own requirements.txt with specific dependencies.

### Authentication & Security
JWT-based authentication with djangorestframework-simplejwt. OAuth2 integration for Google/Facebook login. Each service has its own secret key configuration.

## Service Endpoints

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- User Service Admin: http://localhost:8000/admin
- Elasticsearch: http://localhost:9200
- Kibana Dashboard: http://localhost:5601
- API Documentation: http://localhost:8080/swagger/

## Environment Configuration

Copy `.env.example` to `.env` and configure:
- Database credentials for each service
- Redis connection settings
- Stripe API keys for payments
- AWS credentials for file storage
- Email SMTP settings
- Social auth credentials (Google, Facebook)
- AI service API keys (OpenAI, HuggingFace)

## Troubleshooting

### Database Issues
```bash
# Check database logs
docker-compose logs postgres

# Reset specific service database
docker-compose exec postgres psql -U postgres -c "DROP DATABASE user_service_db;"
docker-compose exec user-service python manage.py migrate
```

### Service Discovery
```bash
# Check network connectivity
docker network ls
docker-compose logs api-gateway
```

### AI Service Issues
```bash
# Check AI service logs and dependencies
docker-compose logs recommendation-engine
docker-compose logs search-service
```

### Performance Issues
- Monitor Redis cache hit rates
- Check Elasticsearch cluster health at http://localhost:9200/_cluster/health
- Use Kibana for application monitoring and log analysis
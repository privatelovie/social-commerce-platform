# Deployment Guide - Social Commerce AI Platform

## Overview
This guide covers deployment options for the Social Commerce AI Platform including Vercel, Docker, and GitHub Actions CI/CD.

## Table of Contents
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Local Development](#local-development)
- [Production Considerations](#production-considerations)

## Environment Variables

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/social_commerce
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social_commerce

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# OpenAI API (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# External API Keys (optional)
AMAZON_ACCESS_KEY=your-amazon-access-key
EBAY_CLIENT_ID=your-ebay-client-id
EBAY_CLIENT_SECRET=your-ebay-client-secret
```

### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000

# Stripe (Public Key)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_AI_FEATURES=true
```

## Vercel Deployment

### Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create Vercel account at [vercel.com](https://vercel.com)

### Backend Deployment
```bash
cd backend
vercel --prod
```

### Frontend Deployment
```bash
cd frontend
vercel --prod
```

### Vercel Environment Variables
Set these in your Vercel dashboard for each project:

**Backend Project:**
- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

**Frontend Project:**
- `REACT_APP_API_URL` (your backend URL)
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`

## Docker Deployment

### Build and Run Locally
```bash
# Build images
docker-compose -f docker-compose.production.yml build

# Run the application
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop the application
docker-compose -f docker-compose.production.yml down
```

### Environment Variables for Docker
Create a `.env` file in the project root:

```bash
# Database
MONGODB_PASSWORD=your-secure-mongodb-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# APIs
OPENAI_API_KEY=sk-your-openai-api-key-here
STRIPE_SECRET_KEY=sk_your_stripe_secret_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Production Docker Deployment
For production servers:

```bash
# Copy docker-compose.production.yml to your server
scp docker-compose.production.yml user@server:/path/to/app/

# SSH into server and run
ssh user@server
cd /path/to/app
docker-compose -f docker-compose.production.yml up -d
```

## GitHub Actions CI/CD

### Required GitHub Secrets
Set these in your GitHub repository settings > Secrets and variables > Actions:

```bash
# Vercel Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_BACKEND_PROJECT_ID=your-backend-project-id
VERCEL_FRONTEND_PROJECT_ID=your-frontend-project-id

# Docker Hub (optional)
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password

# Environment Variables
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
```

### Workflow Triggers
- **Push to `main`**: Runs tests and deploys to production
- **Push to `develop`**: Runs tests only
- **Pull Requests**: Runs tests and builds

### Manual Deployment
To trigger a manual deployment:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### Setup
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start MongoDB (if local)
mongod

# Start Redis (if local)
redis-server

# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm start
```

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Production Considerations

### Security
- Use strong JWT secrets (32+ characters)
- Enable HTTPS/SSL certificates
- Set up rate limiting
- Use environment variables for all secrets
- Implement proper CORS settings

### Performance
- Enable Redis caching
- Optimize database queries
- Use CDN for static assets
- Enable gzip compression
- Monitor application metrics

### Monitoring
- Set up application logging
- Configure error tracking (Sentry)
- Monitor database performance
- Set up uptime monitoring
- Track API response times

### Scaling
- Use database connection pooling
- Implement horizontal scaling with load balancers
- Consider microservices architecture for large scale
- Use caching strategies (Redis, CDN)

### Database
- Set up MongoDB Atlas for managed database
- Configure database backups
- Set up replica sets for high availability
- Monitor database performance and queries

## Deployment Scripts

### Quick Deploy Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Build and test
cd backend && npm test
cd ../frontend && npm test && npm run build

# Deploy to Vercel
cd ../backend && npm run vercel:deploy
cd ../frontend && npm run vercel:deploy

echo "✅ Deployment complete!"
```

### Docker Quick Start
```bash
#!/bin/bash
# docker-start.sh

echo "🐳 Starting Docker containers..."

# Copy environment file
cp .env.example .env

# Build and start services
docker-compose -f docker-compose.production.yml up --build -d

echo "✅ Docker containers started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
```

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure all required env vars are set
2. **CORS Issues**: Configure CORS settings for your domain
3. **Database Connection**: Check MongoDB connection string
4. **Port Conflicts**: Ensure ports 3000 and 5000 are available
5. **Build Failures**: Check Node.js version compatibility

### Health Checks
- Backend health: `GET /api/health`
- Database connection: Check MongoDB logs
- Redis connection: Use `redis-cli ping`

### Logs
```bash
# Vercel logs
vercel logs

# Docker logs
docker-compose logs -f

# Local development
npm run dev (check console output)
```

## Support
For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test database connections
4. Check GitHub Actions workflow status
5. Consult this deployment guide

---

**Last Updated**: September 2025
**Version**: 1.0.0
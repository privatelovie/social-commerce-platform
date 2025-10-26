#!/bin/bash
# deploy.sh - Quick deployment script for Social Commerce Platform

set -e  # Exit on any error

echo "🚀 Starting deployment of Social Commerce AI Platform..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Install with: npm install -g vercel"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Test backend
echo "🧪 Running backend tests..."
cd backend
if npm test; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed. Deployment aborted."
    exit 1
fi

# Test and build frontend
echo "🧪 Running frontend tests..."
cd ../frontend
if npm test -- --watchAll=false; then
    echo "✅ Frontend tests passed"
else
    echo "❌ Frontend tests failed. Deployment aborted."
    exit 1
fi

echo "🏗️ Building frontend..."
if npm run build; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed. Deployment aborted."
    exit 1
fi

# Deploy backend to Vercel
echo "🚀 Deploying backend to Vercel..."
cd ../backend
if npm run vercel:deploy; then
    echo "✅ Backend deployed successfully"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

# Deploy frontend to Vercel
echo "🚀 Deploying frontend to Vercel..."
cd ../frontend
if npm run vercel:deploy; then
    echo "✅ Frontend deployed successfully"
else
    echo "❌ Frontend deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Your application should be available at:"
echo "   Frontend: Check Vercel dashboard for URL"
echo "   Backend API: Check Vercel dashboard for URL"
echo ""
echo "🔍 To view deployment status:"
echo "   vercel ls"
echo ""
echo "📊 To view logs:"
echo "   vercel logs <deployment-url>"
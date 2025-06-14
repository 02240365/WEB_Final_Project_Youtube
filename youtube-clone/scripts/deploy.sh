#!/bin/bash

# YouTube Clone Deployment Script
echo "🚀 Starting YouTube Clone deployment to Render..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    required_vars=("RENDER_API_KEY" "DATABASE_URL" "JWT_SECRET")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        echo "Please set these variables and try again."
        exit 1
    fi
    
    print_status "All required environment variables are set"
}

# Test database connection
test_database() {
    echo "🗄️  Testing database connection..."
    
    cd backend
    if npx prisma db pull > /dev/null 2>&1; then
        print_status "Database connection successful"
    else
        print_error "Database connection failed"
        echo "Please check your DATABASE_URL and ensure the database is accessible"
        exit 1
    fi
    cd ..
}

# Build and test backend
build_backend() {
    echo "🔧 Building backend..."
    
    cd backend
    
    # Install dependencies
    if npm ci; then
        print_status "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    # Generate Prisma client
    if npx prisma generate; then
        print_status "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
    
    # Run tests if they exist
    if npm test > /dev/null 2>&1; then
        print_status "Backend tests passed"
    else
        print_warning "Backend tests failed or not found"
    fi
    
    cd ..
}

# Build and test frontend
build_frontend() {
    echo "🎨 Building frontend..."
    
    cd frontend
    
    # Install dependencies
    if npm ci; then
        print_status "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    # Build the app
    if npm run build; then
        print_status "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    # Run tests if they exist
    if npm test -- --watchAll=false > /dev/null 2>&1; then
        print_status "Frontend tests passed"
    else
        print_warning "Frontend tests failed or not found"
    fi
    
    cd ..
}

# Deploy to Render
deploy_to_render() {
    echo "🚀 Deploying to Render..."
    
    if [ -z "$RENDER_BACKEND_SERVICE_ID" ] || [ -z "$RENDER_FRONTEND_SERVICE_ID" ]; then
        print_warning "Render service IDs not set. Please deploy manually through Render dashboard."
        echo "Backend: Connect your repo and set root directory to 'backend'"
        echo "Frontend: Connect your repo and set root directory to 'frontend'"
        return
    fi
    
    # Deploy backend
    echo "Deploying backend..."
    if curl -s -X POST \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/$RENDER_BACKEND_SERVICE_ID/deploys" > /dev/null; then
        print_status "Backend deployment triggered"
    else
        print_error "Failed to trigger backend deployment"
    fi
    
    # Deploy frontend
    echo "Deploying frontend..."
    if curl -s -X POST \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/$RENDER_FRONTEND_SERVICE_ID/deploys" > /dev/null; then
        print_status "Frontend deployment triggered"
    else
        print_error "Failed to trigger frontend deployment"
    fi
}

# Main deployment process
main() {
    echo "🎬 YouTube Clone Deployment Script"
    echo "=================================="
    
    # Run all checks and builds
    check_env_vars
    test_database
    build_backend
    build_frontend
    deploy_to_render
    
    echo ""
    echo "🎉 Deployment process completed!"
    echo ""
    echo "Next steps:"
    echo "1. Monitor your deployments in the Render dashboard"
    echo "2. Test your deployed application"
    echo "3. Update DNS settings if using custom domains"
    echo ""
    echo "Your services should be available at:"
    echo "- Backend: https://your-backend-service.onrender.com"
    echo "- Frontend: https://your-frontend-service.onrender.com"
}

# Run the main function
main

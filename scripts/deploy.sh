#!/bin/bash

# Production Deployment Script
# This script handles the deployment process for the tattoo website

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tattoo-website"
DOCKER_IMAGE="ghcr.io/$(echo $GITHUB_REPOSITORY | tr '[:upper:]' '[:lower:]'):latest"
BACKUP_DIR="/tmp/backups"
LOG_FILE="/var/log/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if required environment variables are set
    required_vars=("DATABASE_URL" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Extract database connection details
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
    
    # Create PostgreSQL backup
    if command -v pg_dump &> /dev/null; then
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
        success "Database backup created: $BACKUP_FILE"
    else
        warning "pg_dump not available, skipping database backup"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Check if there are pending migrations
    if npm run prisma:migrate 2>&1 | grep -q "No pending migrations"; then
        log "No pending migrations"
    else
        success "Database migrations completed"
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    local url="${1:-http://localhost:3000}"
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f "$url/api/health" &> /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Deploy with Docker
deploy_docker() {
    log "Deploying with Docker..."
    
    # Pull the latest image
    docker pull "$DOCKER_IMAGE"
    
    # Stop existing container if running
    if docker ps -q -f name="$PROJECT_NAME" | grep -q .; then
        log "Stopping existing container..."
        docker stop "$PROJECT_NAME"
        docker rm "$PROJECT_NAME"
    fi
    
    # Run new container
    docker run -d \
        --name "$PROJECT_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        "$DOCKER_IMAGE"
    
    success "Docker container deployed"
}

# Deploy with Docker Compose
deploy_compose() {
    log "Deploying with Docker Compose..."
    
    # Create production docker-compose override
    cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  app:
    image: $DOCKER_IMAGE
    environment:
      - NODE_ENV=production
      - DATABASE_URL=$DATABASE_URL
      - NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
    restart: unless-stopped
EOF

    # Deploy with compose
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    success "Docker Compose deployment completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove old images (keep last 3)
    docker images "$DOCKER_IMAGE" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | sort -k2 -r | tail -n +4 | awk '{print $1}' | xargs -r docker rmi
    
    # Remove unused containers and networks
    docker system prune -f
    
    success "Cleanup completed"
}

# Post-deployment verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if container is running
    if ! docker ps -q -f name="$PROJECT_NAME" | grep -q .; then
        error "Container is not running"
    fi
    
    # Check application health
    health_check "http://localhost:3000"
    
    # Check database connectivity
    log "Checking database connectivity..."
    if docker exec "$PROJECT_NAME" npm run prisma:status &> /dev/null; then
        success "Database connectivity verified"
    else
        warning "Database connectivity check failed"
    fi
    
    success "Deployment verification completed"
}

# Rollback function
rollback() {
    log "Performing rollback..."
    
    # Get previous image
    local previous_image=$(docker images "$DOCKER_IMAGE" --format "{{.Repository}}:{{.Tag}}" | sed -n '2p')
    
    if [[ -z "$previous_image" ]]; then
        error "No previous image found for rollback"
    fi
    
    log "Rolling back to: $previous_image"
    
    # Stop current container
    docker stop "$PROJECT_NAME" || true
    docker rm "$PROJECT_NAME" || true
    
    # Start previous version
    docker run -d \
        --name "$PROJECT_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
        -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        "$previous_image"
    
    health_check
    success "Rollback completed"
}

# Main deployment function
main() {
    local command="${1:-deploy}"
    
    log "Starting deployment process..."
    log "Command: $command"
    log "Environment: ${NODE_ENV:-production}"
    log "Image: $DOCKER_IMAGE"
    
    case "$command" in
        "deploy")
            check_prerequisites
            create_backup
            run_migrations
            
            if [[ -f "docker-compose.yml" ]]; then
                deploy_compose
            else
                deploy_docker
            fi
            
            verify_deployment
            cleanup
            ;;
        "rollback")
            rollback
            ;;
        "health")
            health_check "${2:-http://localhost:3000}"
            ;;
        "backup")
            create_backup
            ;;
        "migrations")
            run_migrations
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup|migrations}"
            echo ""
            echo "Commands:"
            echo "  deploy     - Full deployment process"
            echo "  rollback   - Rollback to previous version"
            echo "  health     - Perform health check"
            echo "  backup     - Create database backup"
            echo "  migrations - Run database migrations"
            exit 1
            ;;
    esac
    
    success "Operation completed successfully"
}

# Trap errors and provide rollback option
trap 'echo -e "\n${RED}Deployment failed!${NC} Run: $0 rollback"; exit 1' ERR

# Run main function with all arguments
main "$@"
#!/bin/bash

# =============================================================================
# YATRI RAKSHAK - PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# This script handles the complete deployment process for Yatri Rakshak
# Author: SIH 2025 Team - GGITS Jabalpur
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting Yatri Rakshak Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="yatri-rakshak"
NODE_VERSION="18"
PM2_APP_NAME="yatri-rakshak-prod"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================

log_info "Performing pre-deployment checks..."

# Check required commands
check_command "node"
check_command "npm"
check_command "git"

# Check Node version
NODE_CURRENT=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
    log_error "Node.js version $NODE_VERSION or higher is required. Current: v$NODE_CURRENT"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    log_error ".env.local file not found!"
    log_info "Please copy .env.production.template to .env.local and configure it."
    exit 1
fi

# Validate required environment variables
source .env.local
if [ -z "$MONGODB_URI" ] || [ -z "$NEXTAUTH_SECRET" ] || [ -z "$NEXTAUTH_URL" ]; then
    log_error "Required environment variables not set in .env.local"
    log_info "Required: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL"
    exit 1
fi

log_success "Pre-deployment checks passed!"

# =============================================================================
# BUILD PROCESS
# =============================================================================

log_info "Starting build process..."

# Clean previous builds
if [ -d ".next" ]; then
    log_info "Cleaning previous build..."
    rm -rf .next
fi

if [ -d "node_modules" ]; then
    log_info "Cleaning node_modules..."
    rm -rf node_modules
fi

# Install dependencies
log_info "Installing production dependencies..."
npm ci --only=production --silent

# Install dev dependencies for build
log_info "Installing dev dependencies for build..."
npm install --silent

# Run build
log_info "Building application..."
npm run build

if [ $? -eq 0 ]; then
    log_success "Build completed successfully!"
else
    log_error "Build failed!"
    exit 1
fi

# =============================================================================
# DATABASE SETUP
# =============================================================================

log_info "Setting up database..."

# Test database connection
node -e "
const connectDB = require('./lib/mongodb.ts').default;
connectDB()
  .then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
" || {
    log_error "Database connection test failed!"
    log_info "Please check your MONGODB_URI in .env.local"
    exit 1
}

log_success "Database connection verified!"

# =============================================================================
# PRODUCTION OPTIMIZATIONS
# =============================================================================

log_info "Applying production optimizations..."

# Create production package.json (remove dev dependencies)
cp package.json package.json.backup
node -e "
const pkg = require('./package.json');
delete pkg.devDependencies;
pkg.scripts = {
  start: 'next start',
  'start:prod': 'NODE_ENV=production next start -p \${PORT:-3000}'
};
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Production package.json created');
"

# Install only production dependencies
log_info "Installing production dependencies only..."
rm -rf node_modules
npm ci --only=production --silent

log_success "Production optimizations applied!"

# =============================================================================
# SECURITY HARDENING
# =============================================================================

log_info "Applying security hardening..."

# Set proper file permissions
chmod 600 .env.local
chmod -R 755 .next
chmod -R 755 public

# Create security headers file
cat > security-headers.conf << EOF
# Security Headers for Yatri Rakshak
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
EOF

log_success "Security hardening completed!"

# =============================================================================
# PM2 CONFIGURATION
# =============================================================================

if command -v pm2 &> /dev/null; then
    log_info "Configuring PM2..."

    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: 'npm',
    args: 'run start:prod',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '60s',
    restart_delay: 4000
  }]
}
EOF

    # Create logs directory
    mkdir -p logs

    log_success "PM2 configuration created!"
else
    log_warning "PM2 not found. Skipping PM2 configuration."
fi

# =============================================================================
# NGINX CONFIGURATION
# =============================================================================

log_info "Creating Nginx configuration..."

cat > nginx.conf << EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (update paths to your certificates)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Include security headers
    include security-headers.conf;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files caching
    location /_next/static/ {
        alias .next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /static/ {
        alias public/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        access_log off;
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

log_success "Nginx configuration created!"

# =============================================================================
# DOCKER CONFIGURATION
# =============================================================================

log_info "Creating Docker configuration..."

cat > Dockerfile << EOF
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
EOF

cat > docker-compose.yml << EOF
version: '3.8'

services:
  yatri-rakshak:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    volumes:
      - ./logs:/app/logs
EOF

cat > .dockerignore << EOF
node_modules
.next
.env.local
.git
.gitignore
README.md
Dockerfile
docker-compose.yml
logs
*.log
EOF

log_success "Docker configuration created!"

# =============================================================================
# MONITORING SETUP
# =============================================================================

log_info "Setting up monitoring..."

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script for Yatri Rakshak
echo "=== Yatri Rakshak System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo

# Check if app is running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
    
    # Try to restart with PM2 if available
    if command -v pm2 &> /dev/null; then
        echo "🔄 Attempting to restart with PM2..."
        pm2 restart yatri-rakshak-prod
    fi
fi

echo
echo "=== Memory Usage ==="
free -h

echo
echo "=== Disk Usage ==="
df -h

echo
echo "=== Recent Logs ==="
tail -n 10 logs/combined.log 2>/dev/null || echo "No logs found"
EOF

chmod +x monitor.sh

# Create systemd service file
cat > yatri-rakshak.service << EOF
[Unit]
Description=Yatri Rakshak - Tourist Safety System
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/var/www/yatri-rakshak
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/yatri-rakshak/.env.local

[Install]
WantedBy=multi-user.target
EOF

log_success "Monitoring setup completed!"

# =============================================================================
# FINAL DEPLOYMENT SUMMARY
# =============================================================================

echo
echo "🎉 Yatri Rakshak Production Deployment Completed!"
echo "=============================================="
echo
log_success "✅ Application built successfully"
log_success "✅ Database connection verified"
log_success "✅ Production optimizations applied"
log_success "✅ Security hardening completed"
log_success "✅ Configuration files created"
echo

echo "📋 Next Steps:"
echo "1. Review and update nginx.conf with your SSL certificates"
echo "2. Copy files to your production server"
echo "3. Install PM2: npm install -g pm2"
echo "4. Start the application: pm2 start ecosystem.config.js"
echo "5. Set up SSL certificates (Let's Encrypt recommended)"
echo "6. Configure your domain DNS to point to the server"
echo "7. Set up automated backups for your database"
echo

echo "🔧 Management Commands:"
echo "- Start: pm2 start ecosystem.config.js"
echo "- Stop: pm2 stop $PM2_APP_NAME"
echo "- Restart: pm2 restart $PM2_APP_NAME"
echo "- Logs: pm2 logs $PM2_APP_NAME"
echo "- Monitor: pm2 monit"
echo "- Health: curl http://localhost:3000/api/health"
echo "- System Status: ./monitor.sh"
echo

echo "📱 Application URLs:"
echo "- Production: https://your-domain.com"
echo "- Health Check: https://your-domain.com/api/health"
echo "- Admin Dashboard: https://your-domain.com/dashboard/admin"
echo

log_info "Don't forget to update your .env.local with production values!"
log_success "Deployment script completed successfully! 🚀"

#!/bin/bash

# Blog Database Docker Setup Script
# Quick setup for PostgreSQL database with seed data

set -e

echo "🚀 Blog Database Setup Script"
echo "============================="
echo ""

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check npm/pnpm
if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null; then
    echo "❌ npm or pnpm is not installed."
    exit 1
fi

echo "📋 Available commands:"
echo ""
echo "Quick Setup (Recommended):"
echo "  ./scripts/db-setup.sh setup    - Start DB, migrate, and seed"
echo ""
echo "Individual Commands:"
echo "  ./scripts/db-setup.sh start    - Start PostgreSQL container"
echo "  ./scripts/db-setup.sh migrate  - Run Prisma migrations"
echo "  ./scripts/db-setup.sh seed     - Seed database with sample data"
echo "  ./scripts/db-setup.sh logs     - View database logs"
echo "  ./scripts/db-setup.sh stop     - Stop database"
echo "  ./scripts/db-setup.sh reset    - Reset database (delete all data)"
echo ""

if [ "$1" == "setup" ]; then
    echo "🔧 Running full setup..."
    echo ""
    
    echo "1️⃣  Starting database..."
    npm run db:up
    
    sleep 3
    
    echo ""
    echo "2️⃣  Running migrations..."
    npm run db:migrate
    
    echo ""
    echo "3️⃣  Seeding database..."
    npm run db:seed
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📊 Database Status:"
    npm run db:logs 2>/dev/null | head -5 || echo "Database is running"
    echo ""
    echo "🎉 You can now start the development server with: npm run dev"
    
elif [ "$1" == "start" ]; then
    echo "Starting database..."
    npm run db:up
    echo "✅ Database started. Use 'npm run db:logs' to check status."
    
elif [ "$1" == "migrate" ]; then
    echo "Running migrations..."
    npm run db:migrate
    echo "✅ Migrations completed."
    
elif [ "$1" == "seed" ]; then
    echo "Seeding database..."
    npm run db:seed
    echo "✅ Database seeded."
    
elif [ "$1" == "logs" ]; then
    echo "Showing database logs (Ctrl+C to exit)..."
    npm run db:logs
    
elif [ "$1" == "stop" ]; then
    echo "Stopping database..."
    npm run db:down
    echo "✅ Database stopped."
    
elif [ "$1" == "reset" ]; then
    echo "⚠️  This will delete all database data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        echo "Resetting database..."
        npm run db:reset
        echo "✅ Database reset."
    else
        echo "❌ Reset cancelled."
    fi
    
elif [ "$1" == "help" ] || [ -z "$1" ]; then
    echo "See available commands above."
    
else
    echo "❌ Unknown command: $1"
    echo "Use './scripts/db-setup.sh help' for available commands."
    exit 1
fi

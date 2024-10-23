#!/bin/bash

# Navigate to your project directory
cd /var/www/devtrend.tech || exit

# Pull the latest changes from the main branch
git pull origin main

# Install dependencies
npm install

# Build the Next.js project
npm run build

# Restart the app with PM2
pm2 reload nextjs-app

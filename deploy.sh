#!/bin/bash

# Navigate to the project directory
cd /var/www/devtrend.tech || exit

# Pull the latest changes from the git repository and ignore any local changes
git fetch origin
git reset --hard origin/main


# Install dependencies
npm install

# Build the Next.js project
npm run build

# Restart the app with PM2
pm2 reload devtrend-tech

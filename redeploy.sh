#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Store the current release
CURRENT_RELEASE=$(readlink .next)

# Build the project in temp directory
BUILD_DIR=temp npm run build || { echo "Build failed"; exit 1; }

# Check if temp directory exists
if [ ! -d "temp" ]; then
    echo "temp Directory not exists!"
    exit 1
fi

# Create release directory if not exists
if [ ! -d "releases" ]; then
    mkdir releases
fi

# Move the build to releases directory with timestamp
NEW_BUILD_DIR="releases/$(date +'%Y%m%d%H%M%S')"
mv temp "$NEW_BUILD_DIR" || { echo "Failed to move build to releases directory"; exit 1; }

# Update the symbolic link after removing old releases
ln -sfn "$NEW_BUILD_DIR" .next || { 
    echo "Failed to update symbolic link"; 
    ln -sfn "$CURRENT_RELEASE" .next  # Revert to the old release
    exit 1; 
}
echo "Release $NEW_BUILD_DIR build successfully"

# Reload the pm2 process
pm2 reload devtrend-tech --update-env || { 
    echo "Failed to reload pm2 process"; 
    ln -sfn "$CURRENT_RELEASE" .next  # Revert to the old release
    exit 1; 
}

# Check the number of releases and keep only 3 latest releases
RELEASES_COUNT=$(find releases -mindepth 1 -maxdepth 1 -type d | wc -l)
if [ "$RELEASES_COUNT" -gt 3 ]; then
    echo "Removing old releases"
    find releases -mindepth 1 -maxdepth 1 -type d | sort | head -n -3 | xargs -I {} rm -rf {} || { echo "Failed to remove old releases"; exit 1; }
    echo "Old releases removed successfully"
fi
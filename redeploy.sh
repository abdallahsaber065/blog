#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Store the current release
CURRENT_RELEASE=$(readlink .next)
echo -e ">>> \033[1;34mCurrent release:\033[0m $CURRENT_RELEASE"

# Clean up old temp directory if exists
if [ -d "temp" ]; then
    echo -e ">>> \033[1;34mCleaning up old temp directory...\033[0m"
    rm -rf temp
fi

# Build the project in temp directory
echo -e ">>> \033[1;34mBuilding the project in temp directory...\033[0m"
BUILD_DIR=temp npm run build || { echo -e "\033[1;31mBuild failed\033[0m"; exit 1; }

# Check if temp directory exists
if [ ! -d "temp" ]; then
    echo -e "\033[1;31mtemp Directory not exists!\033[0m"
    exit 1
fi

echo -e "\033[1;32mBuild successful in temp directory\033[0m"

# Create release directory if not exists
echo -e ">>> \033[1;34mCreating release directory if not exists...\033[0m"
if [ ! -d "releases" ]; then
    mkdir releases
fi

# Move the build to releases directory with timestamp
NEW_BUILD_DIR="releases/$(date +'%Y%m%d%H%M%S')"
echo -e ">>> \033[1;34mMoving build to releases directory...\033[0m"
mv temp "$NEW_BUILD_DIR" || { echo -e "\033[1;31mFailed to move build to releases directory\033[0m"; exit 1; }

echo -e "\033[1;32mBuild moved to $NEW_BUILD_DIR\033[0m"

# Update the symbolic link after removing old releases
echo -e ">>> \033[1;34mUpdating symbolic link...\033[0m"
ln -sfn "$NEW_BUILD_DIR" .next || { 
    echo -e "\033[1;31mFailed to update symbolic link\033[0m"; 
    ln -sfn "$CURRENT_RELEASE" .next  # Revert to the old release
    exit 1; 
}

echo -e "\033[1;32mRelease $NEW_BUILD_DIR staged successfully\033[0m"

# Reload the pm2 process
echo -e ">>> \033[1;34mReloading the pm2 process...\033[0m"
pm2 reload devtrend-tech --update-env || { 
    echo -e "\033[1;31mFailed to reload pm2 process\033[0m"; 
    ln -sfn "$CURRENT_RELEASE" .next  # Revert to the old release
    exit 1; 
}

echo -e "\033[1;32mPM2 process reloaded successfully\033[0m"

# Check the number of releases and keep only 3 latest releases
RELEASES_COUNT=$(find releases -mindepth 1 -maxdepth 1 -type d | wc -l)
if [ "$RELEASES_COUNT" -gt 3 ]; then
    echo -e ">>> \033[1;34mRemoving old releases...\033[0m"
    find releases -mindepth 1 -maxdepth 1 -type d | sort | head -n -3 | xargs -I {} rm -rf {} || { echo -e "\033[1;31mFailed to remove old releases\033[0m"; exit 1; }
    echo -e "\033[1;32mOld releases removed successfully\033[0m"
fi

echo -e "\033[1;32mDeployment successful\033[0m"
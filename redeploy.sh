#!/bin/bash

if [ ! -d "temp" ]; then
    echo "temp Directory not exists!"
    exit 1
fi

# create release directory if not exists
if [ ! -d "releases" ]; then
    mkdir releases
fi

NEW_BUILD_DIR="releases/$(date +'%Y%m%d%H%M%S')"
mv temp "$NEW_BUILD_DIR"

# check the number of releases and keep only 2 latest releases
RELEASES_COUNT=$(find releases -mindepth 1 -maxdepth 1 -type d | wc -l)
if [ "$RELEASES_COUNT" -gt 3 ]; then
    echo "Removing old releases"
    find releases -mindepth 1 -maxdepth 1 -type d | sort | head -n -2 | xargs -I {} rm -rf {}
fi

ln -sfn "$NEW_BUILD_DIR" .next

echo "Release $NEW_BUILD_DIR build successfully"
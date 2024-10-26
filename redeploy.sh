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

ln -sfn "$NEW_BUILD_DIR" .next

echo "Release $NEW_BUILD_DIR build successfully"
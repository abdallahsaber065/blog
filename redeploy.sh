#!/bin/bash

cd /var/www/devtrend.tech || exit

# Update the symbolic link after removing old releases
echo -e ">>> \033[1;34mUpdating symbolic link...\033[0m"
ln -sfn "$NEW_BUILD_DIR" .next && { 
    echo -e "\033[1;32mSuccessfully updated symbolic link to $NEW_BUILD_DIR\033[0m";
} || { 
    echo -e "\033[1;31mFailed to update symbolic link\033[0m"; 
    ln -sfn "$CURRENT_RELEASE" .next  # Revert to the old release
    echo -e "\033[1;31mReverted to the old release $CURRENT_RELEASE\033[0m";
}

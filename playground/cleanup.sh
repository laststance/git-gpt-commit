#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$SCRIPT_DIR/test-repo"

if [ -d "$REPO_DIR" ]; then
    rm -rf "$REPO_DIR"
    echo "Cleaned up test repository"
else
    echo "No test repository to clean up"
fi

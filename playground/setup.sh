#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$SCRIPT_DIR/test-repo"

echo "Setting up test repository..."

# Clean up existing test repo
if [ -d "$REPO_DIR" ]; then
    rm -rf "$REPO_DIR"
fi

# Create and initialize test repo
mkdir -p "$REPO_DIR"
cd "$REPO_DIR"
git init

# Create initial commit
echo "// Initial file" > app.js
git add app.js
git commit -m "initial commit"

# Make a change and stage it
cat > app.js << 'EOF'
// Application entry point
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { greet };
EOF
git add app.js

echo ""
echo "Test repository created at: $REPO_DIR"
echo ""
echo "Staged changes:"
git diff --cached --stat
echo ""
echo "To test commit message generation:"
echo "  cd $REPO_DIR"
echo "  node ../../index.js commit"

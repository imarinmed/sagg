#!/bin/bash
# sync-screenshots.sh
# Automatically syncs screenshots from data/ to frontend/public/
# Run this script whenever new screenshots are added to data/

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Syncing screenshots from data/ to frontend/public/...${NC}"

# Source and destination
SOURCE_DIR="/Users/wolfy/Developer/2026.Y/bats/data/video_analysis/screenshots"
DEST_DIR="/Users/wolfy/Developer/2026.Y/bats/.opencode/worktrees/feat/mythos-premium-redesign/frontend/public/screenshots"

# Create destination if it doesn't exist
mkdir -p "$DEST_DIR"

# Sync all screenshots while preserving structure
# Using rsync for efficient syncing (only copies changed files)
if command -v rsync &> /dev/null; then
    rsync -av --progress "$SOURCE_DIR/" "$DEST_DIR/" --exclude="catalog.json" --exclude="*.md"
else
    # Fallback to cp -r if rsync not available
    cp -r "$SOURCE_DIR"/* "$DEST_DIR/" 2>/dev/null || true
fi

# Count synced files
FILE_COUNT=$(find "$DEST_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | wc -l)

echo -e "${GREEN}✅ Synced $FILE_COUNT images${NC}"
echo -e "${YELLOW}📁 Destination: $DEST_DIR${NC}"
echo -e "${YELLOW}⚠️  Remember to restart the dev server to see changes!${NC}"

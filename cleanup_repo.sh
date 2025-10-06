#!/bin/bash

# Repository cleanup script
echo "Starting repository cleanup..."

# Use GitHub Desktop's git
GIT="/Applications/GitHub\ Desktop.app/Contents/Resources/app/git/bin/git"

# Remove backup HTML files
echo "Removing backup HTML files..."
$GIT rm -f current_optimized_backup_*.html
$GIT rm -f current_optimized_2025*.html
$GIT rm -f current_optimized_WORKING_*.html
$GIT rm -f current.html

# Remove session summaries and planning files
echo "Removing session documentation..."
$GIT rm -f SESSION_SUMMARY_*.md
$GIT rm -f NEXT_SESSION_PROMPT_*.md
$GIT rm -f EFDR_OPTIMIZATION_*.md
$GIT rm -f OPTIMIZATION_PLAN_*.md
$GIT rm -f PERSISTENT_DATA_*.md
$GIT rm -f ALPHA_SPACING_*.md
$GIT rm -f TESTING_INSTRUCTIONS.md
$GIT rm -f PROJECT_STRUCTURE.md

# Remove test files
echo "Removing test files..."
$GIT rm -f test_*.html
$GIT rm -f test_*.js
$GIT rm -f validation_script.js

# Remove screenshots and images
echo "Removing screenshots..."
$GIT rm -f *.png

# Remove CSV data files
echo "Removing data files..."
$GIT rm -f *.csv

# Remove deployment files (if not using)
echo "Removing deployment configs..."
$GIT rm -f netlify.toml
$GIT rm -f _redirects
$GIT rm -f index.html
$GIT rm -rf deploy/

# Remove system files
echo "Removing system files..."
$GIT rm -f .DS_Store

# Remove the fdr-worker backup
$GIT rm -f fdr-worker_FIXED_*.js

# Remove directories and symlinks that aren't needed
$GIT rm -f Data
$GIT rm -f docs
$GIT rm -rf {backups}

echo "Cleanup complete!"
echo ""
echo "Files remaining in repository:"
$GIT ls-files | wc -l
echo ""
echo "Key files that remain:"
$GIT ls-files | grep -E "(current_optimized\.html|fdr-worker\.js|README\.md|LICENSE|\.gitignore|CLAUDE\.md)"
#!/bin/bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
echo ""
echo "✅ Code ready to push!"
echo ""
echo "Now run these commands (replace YOUR_REPO_URL with the URL GitHub gives you):"
echo "  git remote add origin YOUR_REPO_URL"
echo "  git push -u origin main"

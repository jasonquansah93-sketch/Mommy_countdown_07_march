#!/bin/bash
# Push Mommy Countdown zu GitHub (HTTPS + gh Auth)
set -e
cd "$(dirname "$0")"
echo "=== gh Auth Status ==="
gh auth status
echo ""
echo "=== Git Push ==="
git push -u origin main
echo ""
echo "=== Fertig! Prüfe: https://github.com/jasonquansah93-sketch/Mommy_countdown_07_march ==="

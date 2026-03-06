#!/bin/bash
# Sauberer Rebuild – behebt "Hinweis Vollversion"-Dialog (staler Metro-Cache)
set -e
cd "$(dirname "$0")"

echo "=== 1. Metro beenden ==="
pkill -f "metro" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
sleep 2

echo "=== 2. Cache löschen ==="
rm -rf "$TMPDIR"/metro-* "$TMPDIR"/haste-* node_modules/.cache 2>/dev/null || true

echo "=== 3. iOS Build (Metro startet mit frischem Cache) ==="
npx expo run:ios --device

echo "=== Fertig! App testen: Video-Wizard → Jetzt erstellen → Ladeindikator, dann Video ==="

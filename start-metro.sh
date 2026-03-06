#!/bin/bash
# Metro starten – Port 8082 (wie im AppDelegate)
cd "$(dirname "$0")"
echo "Starte Metro auf Port 8082..."
echo "App öffnen → 'Reload JS' tippen wenn verbunden."
RCT_METRO_PORT=8082 npx expo start --lan

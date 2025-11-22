#!/bin/bash
# Remove quarantine attribute from BetterApp
# This allows the app to run without Gatekeeper warnings

APP_PATH="/Volumes/BetterApp 1.0.0-arm64/BetterApp.app"

if [ -d "$APP_PATH" ]; then
    xattr -dr com.apple.quarantine "$APP_PATH"
    echo "✅ Quarantine removed! You can now open BetterApp normally."
else
    echo "⚠️  BetterApp.app not found. Make sure the DMG is mounted."
fi


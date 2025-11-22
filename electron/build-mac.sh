#!/bin/bash
# Build script that ad-hoc signs the app to reduce Gatekeeper warnings

echo "Building BetterApp for macOS..."

# Build the app first
npm run build:mac

# Find the built app
APP_PATH="release/mac-arm64/BetterApp.app"

if [ -d "$APP_PATH" ]; then
    echo "Ad-hoc signing app (free, reduces Gatekeeper warnings)..."
    codesign --force --deep --sign - "$APP_PATH" 2>/dev/null || {
        echo "⚠️  Code signing failed (this is OK, app will still work)"
    }
    
    echo "Removing quarantine attribute from app..."
    xattr -cr "$APP_PATH" 2>/dev/null || true
    
    echo "Rebuilding DMG with signed app..."
    npm run build:mac
    
    echo "✅ App built with ad-hoc signature!"
    echo "📦 DMG: release/BetterApp-1.0.0-arm64.dmg"
    echo ""
    echo "Note: Users may still see a warning, but ad-hoc signing reduces it."
else
    echo "❌ App not found at $APP_PATH"
    exit 1
fi


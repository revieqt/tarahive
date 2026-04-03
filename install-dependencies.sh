#!/bin/bash

# Install dependencies for all apps in the monorepo
# Unix/Linux/macOS bash script

echo "================================"
echo "TaraG - Installing Dependencies"
echo "================================"
echo ""

ROOT_DIR=$(pwd)
APPS=(
    "Admin Dashboard:apps/tarag_admin"
    "Mobile App:apps/tarag_app"
    "Backend:backend"
)

SUCCESS=()
FAILED=()

for app_info in "${APPS[@]}"; do
    IFS=':' read -r app_name app_path <<< "$app_info"
    
    echo "📦 Installing $app_name..."
    echo "   Path: $app_path"
    
    if [ -d "$app_path" ]; then
        cd "$app_path"
        
        if [ -f "package.json" ]; then
            if npm install; then
                SUCCESS+=("$app_name")
                echo "✅ $app_name installed successfully"
            else
                FAILED+=("$app_name")
                echo "❌ Failed to install $app_name"
            fi
        else
            echo "⚠️  package.json not found in $app_path"
            FAILED+=("$app_name")
        fi
        
        cd "$ROOT_DIR"
    else
        echo "❌ Directory not found: $app_path"
        FAILED+=("$app_name")
    fi
    
    echo ""
done

# Summary
echo "================================"
echo "Installation Summary"
echo "================================"

if [ ${#SUCCESS[@]} -gt 0 ]; then
    echo "✅ Successfully installed:"
    for app in "${SUCCESS[@]}"; do
        echo "   - $app"
    done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
    echo "❌ Failed to install:"
    for app in "${FAILED[@]}"; do
        echo "   - $app"
    done
fi

echo ""

if [ ${#FAILED[@]} -eq 0 ]; then
    echo "🎉 All dependencies installed successfully!"
    exit 0
else
    echo "⚠️  Some installations failed. Check errors above."
    exit 1
fi

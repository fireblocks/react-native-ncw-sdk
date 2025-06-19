#!/bin/bash

# Launch iOS Simulator without proxy settings for development
# This bypasses corporate proxy/Zscaler for the simulator

echo "🚀 Launching iOS Simulator without proxy settings..."

# Clear proxy environment variables
export http_proxy=""
export https_proxy=""
export HTTP_PROXY=""
export HTTPS_PROXY=""
export no_proxy="*"
export NO_PROXY="*"

# Kill existing simulator instances
echo "📱 Stopping existing simulators..."
killall "Simulator" 2>/dev/null || true

# Wait a moment
sleep 2

# Launch simulator
echo "📲 Starting iOS Simulator..."
open -a Simulator

echo "✅ Simulator launched! Now run: npm run ios"
echo "💡 The simulator should now bypass Zscaler for network requests"
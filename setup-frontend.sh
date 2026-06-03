#!/bin/bash
# Frontend setup script for Linux/macOS

echo "🔧 Setting up HalluProbe Frontend..."

# Check Node version
node_version=$(node --version)
echo "✓ Node version: $node_version"

# Install dependencies
echo "📥 Installing dependencies..."
cd frontend
npm install

# Create environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_FEATURES=true
EOF
fi

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start dev:    npm run dev"
echo "   2. Build:        npm run build"
echo "   3. Start prod:   npm start"
echo ""
echo "🌐 URL: http://localhost:3000"

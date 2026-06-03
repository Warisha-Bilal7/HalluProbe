#!/bin/bash
# Backend setup script for Linux/macOS

echo "🔧 Setting up HalluProbe Backend..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv backend/venv
fi

# Activate virtual environment
source backend/venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
cd backend
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data checkpoints outputs logs

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Activate venv: source backend/venv/bin/activate"
echo "   2. Start API:     python run_server.py"
echo "   3. Start demo:    python run_demo.py"
echo ""
echo "🌐 URLs:"
echo "   API:  http://localhost:8000"
echo "   Demo: http://localhost:7860"

#!/bin/bash

# Script to start the AI model server for FoodCast
# This script ensures the Python model server is running on port 5001

echo "🚀 Starting FoodCast AI Model Server..."

# Check if we're in the right directory
if [ ! -f "backend/model_server.py" ]; then
    echo "❌ Error: model_server.py not found. Please run this script from the FoodCast root directory."
    exit 1
fi

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 could not be found. Please install Python 3."
    exit 1
fi

# Check if the model server is already running
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ AI Model Server is already running on port 5001"
    echo "🔗 Health check: http://localhost:5001/health"
    echo "🔗 Prediction endpoint: http://localhost:5001/predict"
    exit 0
fi

# Navigate to backend directory
cd backend

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt > /dev/null 2>&1
fi

# Start the model server
echo "🤖 Starting Python Flask model server on port 5001..."
echo "📊 Model will be loaded and trained automatically..."
echo "⏳ This may take a few moments..."

# Run the model server in the background
nohup python3 model_server.py > model_server.log 2>&1 &

# Wait a moment for the server to start
sleep 3

# Check if the server started successfully
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ AI Model Server started successfully!"
    echo "🔗 Health check: http://localhost:5001/health"
    echo "🔗 Prediction endpoint: http://localhost:5001/predict"
    echo "📝 Logs: backend/model_server.log"
    echo ""
    echo "🎯 Your AI predictions should now work in the web app!"
    echo "💡 To stop the server, find its PID with: ps aux | grep model_server"
else
    echo "❌ Failed to start AI Model Server"
    echo "📝 Check the logs: backend/model_server.log"
    exit 1
fi

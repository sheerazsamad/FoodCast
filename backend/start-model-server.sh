#!/bin/bash

# FoodCast AI Model Server Startup Script
# This script starts the Python model server for the FoodCast application

echo "🚀 Starting FoodCast AI Model Server..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "surplus_model.py" ]; then
    echo "❌ surplus_model.py not found. Please run this script from the backend directory."
    exit 1
fi

# Check if required data files exist
if [ ! -d "../data" ]; then
    echo "❌ Data directory not found. Please ensure the data directory exists with required CSV files."
    exit 1
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please check your Python environment."
        exit 1
    fi
fi

# Start the model server
echo "🤖 Starting AI model server on port 5001..."
python3 model_server.py

echo "✅ Model server started successfully!"
echo "🌐 API available at: http://localhost:5001"
echo "📊 Health check: http://localhost:5001/health"
echo "🔮 Prediction endpoint: http://localhost:5001/predict"

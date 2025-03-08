#!/bin/bash

# Exit script if any command fails
set -e

echo "Starting Twitter Clone local development environment..."

# Check prerequisites
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is required but not installed."
    exit 1
fi

# Check if Node.js and npm are installed (for React frontend)
if ! command -v node &> /dev/null; then
    echo "Warning: Node.js is not installed. React frontend won't be available."
    HAS_NODE=false
else
    HAS_NODE=true
fi

if ! command -v npm &> /dev/null; then
    echo "Warning: npm is not installed. React frontend won't be available."
    HAS_NPM=false
else
    HAS_NPM=true
fi

# Check if Rust/Cargo is installed (needed for pydantic)
if ! command -v cargo &> /dev/null; then
    echo "Warning: Rust/Cargo is not installed. Using older version of pydantic to avoid compilation."
fi

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Start backend server in the background
echo "Starting backend server..."
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Ask user which frontend to start
if $HAS_NODE && $HAS_NPM; then
    echo ""
    echo "Which frontend would you like to run?"
    echo "1) React frontend (recommended)"
    echo "2) Legacy HTML/JS frontend"
    echo "3) Both frontends"
    echo ""
    read -p "Enter your choice (1-3, default: 1): " FRONTEND_CHOICE
    
    if [ -z "$FRONTEND_CHOICE" ]; then
        FRONTEND_CHOICE=1
    fi
else
    # If Node.js or npm are not available, default to legacy frontend
    FRONTEND_CHOICE=2
    echo "Defaulting to legacy frontend due to missing Node.js dependencies"
fi

# Start frontend(s) based on user choice
case $FRONTEND_CHOICE in
    1)
        # Start React frontend
        echo "Starting React frontend..."
        cd frontend/react-app
        if [ ! -d "node_modules" ]; then
            echo "Installing React dependencies (this may take a moment)..."
            npm install
        fi
        npm start &
        REACT_PID=$!
        cd ../..
        ;;
    2)
        # Start legacy frontend
        echo "Starting legacy frontend..."
        cd frontend
        python3 -m http.server 8080 &
        LEGACY_PID=$!
        cd ..
        ;;
    3)
        # Start both frontends
        echo "Starting React frontend..."
        cd frontend/react-app
        if [ ! -d "node_modules" ]; then
            echo "Installing React dependencies (this may take a moment)..."
            npm install
        fi
        npm start &
        REACT_PID=$!
        cd ../..
        
        echo "Starting legacy frontend..."
        cd frontend
        python3 -m http.server 8080 &
        LEGACY_PID=$!
        cd ..
        ;;
    *)
        echo "Invalid choice. Exiting."
        kill $BACKEND_PID
        exit 1
        ;;
esac

echo ""
echo "Services started successfully!"
echo "Backend running at: http://localhost:8000"
if [ -n "$REACT_PID" ]; then
    echo "React frontend running at: http://localhost:3000"
fi
if [ -n "$LEGACY_PID" ]; then
    echo "Legacy frontend running at: http://localhost:8080"
fi
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and kill background processes
trap "echo 'Shutting down services...'; kill $BACKEND_PID $REACT_PID $LEGACY_PID 2>/dev/null; exit" INT

# Wait for processes
wait
#!/bin/bash

# Check if Python and Node.js are installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.12 or later."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Start backend server
echo "Starting FastAPI backend server..."
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend server
echo "Starting Next.js frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Register the cleanup function for the SIGINT signal (Ctrl+C)
trap cleanup SIGINT

echo ""
echo "Development servers are running:"
echo "- Backend: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait indefinitely
wait
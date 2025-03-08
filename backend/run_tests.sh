#!/bin/bash

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Twitter Clone Backend Test Suite${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating a new one...${NC}"
    python -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment. Please install Python 3.6+ and try again.${NC}"
        exit 1
    fi
fi

# Determine the activate script based on the OS
if [ -f "venv/bin/activate" ]; then
    # Unix/Linux/MacOS
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    # Windows
    source venv/Scripts/activate
else
    echo -e "${RED}Could not find activation script for the virtual environment.${NC}"
    exit 1
fi

# Install requirements
echo -e "${YELLOW}Installing requirements...${NC}"
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install requirements.${NC}"
    exit 1
fi

# Install pytest if not already installed
pip install pytest pytest-cov

# Run the tests with coverage
echo -e "${YELLOW}Running tests with coverage...${NC}"
python -m pytest tests/ -v --cov=app

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi

# Run specific tests if specified as arguments
if [ "$#" -gt 0 ]; then
    echo -e "${YELLOW}Running specific tests: $@${NC}"
    python -m pytest $@ -v
fi

# Deactivate the virtual environment
deactivate

echo -e "${GREEN}Test suite completed.${NC}"
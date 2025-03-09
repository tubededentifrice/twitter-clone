#!/bin/bash
set -e

# Script to build and publish Docker images to Docker Hub

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log in to Docker Hub
echo -e "${BLUE}Logging in to Docker Hub...${NC}"
docker login

# Build the images
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose build

# Tag with version if provided
if [ -n "$1" ]; then
  VERSION=$1
  echo -e "${BLUE}Tagging with version: ${GREEN}$VERSION${NC}"
  
  # Tag backend
  docker tag tubededentifrice/twitter-clone-backend:latest tubededentifrice/twitter-clone-backend:$VERSION
  
  # Tag frontend
  docker tag tubededentifrice/twitter-clone-frontend:latest tubededentifrice/twitter-clone-frontend:$VERSION
fi

# Push to Docker Hub
echo -e "${BLUE}Pushing images to Docker Hub...${NC}"

# Push backend
echo -e "${BLUE}Pushing backend image...${NC}"
docker push tubededentifrice/twitter-clone-backend:latest

# Push frontend
echo -e "${BLUE}Pushing frontend image...${NC}"
docker push tubededentifrice/twitter-clone-frontend:latest

# Push version tags if provided
if [ -n "$1" ]; then
  echo -e "${BLUE}Pushing version tags: ${GREEN}$VERSION${NC}"
  
  # Push backend version
  docker push tubededentifrice/twitter-clone-backend:$VERSION
  
  # Push frontend version
  docker push tubededentifrice/twitter-clone-frontend:$VERSION
fi

echo -e "${GREEN}Successfully published to Docker Hub!${NC}"
echo -e "Backend image: ${GREEN}tubededentifrice/twitter-clone-backend${NC}"
echo -e "Frontend image: ${GREEN}tubededentifrice/twitter-clone-frontend${NC}"
echo -e ""
echo -e "To run the application:"
echo -e "${BLUE}docker-compose up -d${NC}"
#!/bin/bash
set -e

# Script to build and publish Docker image to Docker Hub

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Log in to Docker Hub
echo -e "${BLUE}Logging in to Docker Hub...${NC}"
docker login

# Build the image
echo -e "${BLUE}Building Docker image...${NC}"
docker-compose build

# Tag with version if provided
if [ -n "$1" ]; then
  VERSION=$1
  echo -e "${BLUE}Tagging with version: ${GREEN}$VERSION${NC}"
  docker tag tubededentifrice/twitter-clone:latest tubededentifrice/twitter-clone:$VERSION
fi

# Push to Docker Hub
echo -e "${BLUE}Pushing to Docker Hub...${NC}"
docker push tubededentifrice/twitter-clone:latest

# Push version tag if provided
if [ -n "$1" ]; then
  echo -e "${BLUE}Pushing version tag: ${GREEN}$VERSION${NC}"
  docker push tubededentifrice/twitter-clone:$VERSION
fi

echo -e "${GREEN}Successfully published to Docker Hub!${NC}"
echo -e "Image: ${GREEN}tubededentifrice/twitter-clone${NC}"
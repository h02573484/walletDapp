#!/bin/bash
# Script to properly build the application for production deployment on Render

echo "Starting build process for Render deployment..."

# Clean existing build artifacts
echo "Cleaning previous build files..."
rm -rf dist server/public

# Run the build process
echo "Building client application..."
npm run build

# Ensure server/public directory exists
echo "Creating server/public directory..."
mkdir -p server/public

# Copy the built files to the correct location
echo "Copying built files to server/public..."
cp -r dist/public/* server/public/

# Ensure textures are properly copied to both locations
echo "Copying textures to ensure availability..."
mkdir -p server/public/textures
mkdir -p server/public/earth

# Copy Earth textures (handle both potential locations)
if [ -d "client/public/earth" ]; then
  cp -r client/public/earth/* server/public/earth/ || true
fi

if [ -d "public/textures" ]; then
  cp -r public/textures/* server/public/textures/ || true
fi

echo "Build process completed successfully."
#!/bin/bash

echo "Azure App Service deployment script"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "Installing dependencies..."
npm install --production=false

echo "Building Angular application..."
npm run build:prod

echo "Deployment completed successfully!"

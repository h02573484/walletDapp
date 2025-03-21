# Render Deployment Guide

This guide explains how to deploy this application to Render.com with the correct configuration.

## Configuration Files

The following files are used for Render deployment:

- `render.yaml` - Defines the service configuration for Render
- `scripts/build-for-render.sh` - Helper script to ensure correct build and file copying
- `scripts/render-start.sh` - Script for starting the application with proper database checks

### render.yaml

The `render.yaml` file is a [Render Blueprint](https://render.com/docs/blueprint-spec) that configures your application's deployment. It specifies:

- Build commands
- Start commands
- Environment variables
- Health check endpoint
- Files to include in deployment
- Persistent storage settings

### build-for-render.sh

This script handles the production build process:

1. Cleans previous build artifacts
2. Runs the build process
3. Ensures target directories exist
4. Copies built files to the correct locations
5. Handles asset copying (textures, images, etc.)

### render-start.sh

This script handles the application startup:

1. Creates fallback error pages if build fails
2. Tests database connection
3. Starts the application in production mode

## Deployment Steps

1. **Create a Render Account**: Sign up at [render.com](https://render.com) if you don't have an account

2. **Connect Your Repository**:
   - Connect GitHub/GitLab to Render
   - Or use the "Deploy from Git Repository" option

3. **Use Blueprint for Deployment**:
   - Render will detect the `render.yaml` file
   - This should auto-configure your deployment

4. **Manual Setup (if needed)**:
   - Name: wallet-connect-app
   - Build Command: `npm ci && chmod +x scripts/build-for-render.sh && ./scripts/build-for-render.sh`
   - Start Command: `npm run start`
   - Environment: Node
   - Environment Variables:
     - NODE_ENV: production
     - PORT: 5000
     - SESSION_SECRET: (generate a random string)
     - DATABASE_URL: (if using a database)

5. **Set Up Persistent Disk**:
   - Mount Path: /data
   - Size: 5GB
   
6. **Database Configuration**:
   - Create a PostgreSQL database in Render
   - Link the database to your web service
   - Render will automatically set the DATABASE_URL environment variable
   - Our render-start.sh script will test the connection before starting the application

7. **Environment Variables**:
   - Required environment variables:
     - NODE_ENV: production
     - PORT: 5000 (or let Render assign it)
     - DATABASE_URL: (set automatically when linking a Render PostgreSQL database)
     - SESSION_SECRET: (use Render's auto-generation feature)
   - Optional environment variables:
     - OPENAI_API_KEY: (if using AI features)
     - Other API keys as needed for your specific application

## Debugging Deployment Issues

If you encounter deployment problems:

1. **Check Build Logs**:
   - Look for build errors in the Render logs
   - Verify the build script is executing correctly

2. **Clear Build Cache**:
   - In Render dashboard, find "Clear Build Cache"
   - This forces a fresh build with no cached files

3. **Verify Environment Variables**:
   - Make sure all required environment variables are set

4. **Check Health Endpoint**:
   - The `/api/health` endpoint should return status 200
   - Render uses this to verify your app is running

5. **Database Connection**:
   - If using a database, verify connection strings are correct

## Local Testing Before Deployment

Test the production build locally:

```bash
# Build for production
./scripts/build-for-render.sh

# Start in production mode
NODE_ENV=production npm run start
```

## Updating Your Deployment

When pushing changes:

1. Render will automatically rebuild and deploy
2. Monitor the deployment logs for any issues
3. Verify your changes are reflected in the live site

If you see an old version, try:
- Clear browser cache and cookies
- Clear Render's build cache
- Force a manual redeploy from the Render dashboard
# Fly.io GitHub Integration Deployment Guide

This guide explains how to deploy the DoIt4TheInk frontend to Fly.io using the Fly.io GitHub integration.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **GitHub Repository**: This repository (doit4theink-frontend) containing your Next.js app

## Deployment Steps

### First-time Deployment

1. Go to the [Fly.io Dashboard](https://fly.io/dashboard)

2. Click on "Launch a new app"

3. Choose "Deploy from GitHub repository"

4. Find and select the "zonder-ai/doit4theink-frontend" repository

5. On the configuration page:
   - Choose an app name (e.g., doit4theink-frontend)
   - Select your organization
   - Choose a region (e.g., Madrid/mad)
   - Configure environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://fmkzfzlujrmwipkoubmm.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
     ```
   - Click "Create App" to start the deployment

6. Wait for the deployment to complete

### Important Notes

1. **Do NOT manually create a fly.toml file** - When using the GitHub integration, Fly.io will generate this file automatically based on your app detection during deployment

2. **Dockerfile** - We've provided a standard Dockerfile optimized for Next.js applications that should work with Fly.io's automatic detection

3. **next.config.js** - Make sure your next.config.js includes:
   ```js
   {
     output: 'standalone',
     images: {
       domains: ['fmkzfzlujrmwipkoubmm.supabase.co'],
       unoptimized: process.env.NODE_ENV === 'production',
     }
   }
   ```

## Troubleshooting

If your deployment fails:

1. **Check the logs** in the Fly.io dashboard for specific errors

2. **Common issues**:
   - Missing environment variables
   - Build failures (check if local build works)
   - Next.js configuration issues

3. **If you continue to have issues**:
   - Try creating the app through the Fly CLI first:
     ```
     flyctl launch --no-deploy
     ```
   - Then push your code to GitHub and deploy through the GitHub integration

4. **App detection issues**:
   - If Fly.io has trouble detecting your Next.js app, make sure:
     - You don't have a custom fly.toml file (delete it if it exists)
     - Your package.json has the correct dependencies and scripts
     - Your Dockerfile follows Next.js best practices (like the one provided)

## Subsequent Deployments

Once your app is successfully deployed, any push to the main branch will trigger a new deployment through the GitHub integration.

If you need to update environment variables or other app configurations, use the Fly.io dashboard or CLI.

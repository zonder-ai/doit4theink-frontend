# Deploying DoIt4TheInk to Fly.io

This document explains how to deploy the DoIt4TheInk frontend to Fly.io using Docker.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **Fly CLI**: Install the Fly CLI from https://fly.io/docs/hands-on/install-flyctl/
3. **GitHub Actions Secrets** (if using GitHub Actions): Set up the following secrets in your GitHub repository:
   - `FLY_API_TOKEN`: Your Fly.io API token
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

## Manual Deployment (Recommended for First Time)

1. Log in to Fly.io:
   ```bash
   flyctl auth login
   ```

2. Launch your app (do this if you're creating a new app on fly.io):
   ```bash
   # Remove old files if they exist
   rm -f fly.toml

   # Create new app
   flyctl launch
   
   # When prompted:
   # - Choose an app name (e.g., doit4theink-frontend)
   # - Choose an organization
   # - Choose a region (e.g., mad for Madrid)
   # - Don't setup Postgres or Redis
   # - Deploy now? Select No
   ```

3. Configure your environment variables:
   ```bash
   flyctl secrets set \
     NEXT_PUBLIC_SUPABASE_URL=https://fmkzfzlujrmwipkoubmm.supabase.co \
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. Deploy your application:
   ```bash
   flyctl deploy
   ```

## Using GitHub Actions (For Subsequent Deployments)

The repository is configured with GitHub Actions to automatically deploy when you push to the main branch:

1. Make sure all required GitHub secrets are set as described in the Prerequisites section
2. Push your changes to the main branch
3. The GitHub workflow will automatically deploy to Fly.io

You can also manually trigger the workflow from the "Actions" tab in your GitHub repository.

## Key Configuration Files

### fly.toml

The `fly.toml` file contains the configuration for your Fly.io application. It specifies:

- Application name
- Region
- Build configuration (uses Dockerfile)
- HTTP service configuration

### Dockerfile

The Dockerfile is optimized for Next.js and creates a production-ready container. It:

1. Sets up a Node.js environment
2. Installs dependencies
3. Builds the Next.js application
4. Creates a minimal production image
5. Configures the container to run the application

### next.config.js

The `next.config.js` file is configured for deployment with:

```javascript
{
  output: 'standalone',
  images: {
    domains: ['fmkzfzlujrmwipkoubmm.supabase.co'],
    unoptimized: process.env.NODE_ENV === 'production',
  }
}
```

This enables the standalone output mode required for containerized Next.js applications.

## Troubleshooting

### Common Issues

1. **Deployment Fails Due to Environment Variables**:
   - Make sure all required environment variables are set as Fly.io secrets
   - Check the logs with `flyctl logs`

2. **Build Process Fails**:
   - Ensure your package.json has the correct scripts:
     - `"build": "next build"`
     - `"start": "next start"`

3. **App Starts But Shows Blank Screen or Errors**:
   - Check for runtime errors in the logs with `flyctl logs`
   - Ensure all environment variables are correctly set

### Advanced Troubleshooting

If you encounter persistent issues:

1. Try deploying locally first to debug:
   ```bash
   # Build the Docker image locally
   docker build -t doit4theink-frontend .
   
   # Run the image locally
   docker run -p 3000:3000 doit4theink-frontend
   ```

2. If that works but fly.io deployment doesn't, try:
   ```bash
   # Start with a fresh deployment
   flyctl apps destroy doit4theink-frontend
   
   # Then create a new app and follow the manual deployment steps
   ```

### Debugging

To view the logs of your application:
```bash
flyctl logs
```

To see the status of your app:
```bash
flyctl status
```

## Environment Management

### Adding More Environment Variables

If you need to add more environment variables to your deployed app:

```bash
flyctl secrets set NEW_ENV_VARIABLE=value
```

### Viewing Current Secrets

To list all current secrets:
```bash
flyctl secrets list
```

## Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker and Next.js](https://nextjs.org/docs/deployment#docker-image)

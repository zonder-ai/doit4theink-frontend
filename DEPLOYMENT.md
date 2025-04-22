# Deploying DoIt4TheInk to Fly.io

This document explains how to deploy the DoIt4TheInk frontend to Fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **Fly CLI**: Install the Fly CLI from https://fly.io/docs/hands-on/install-flyctl/
3. **GitHub Actions Secrets**: Set up the following secrets in your GitHub repository:
   - `FLY_API_TOKEN`: Your Fly.io API token
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

The repository is configured with GitHub Actions to automatically deploy when you push to the main branch:

1. Make sure all required GitHub secrets are set
2. Push your changes to the main branch
3. The GitHub workflow will automatically deploy to Fly.io

You can also manually trigger the workflow from the "Actions" tab in your GitHub repository.

### Method 2: Manual Deployment

If you prefer to deploy manually:

1. Log in to Fly.io:
   ```bash
   flyctl auth login
   ```

2. Create a Fly.io app (only needed for the first deployment):
   ```bash
   flyctl apps create doit4theink-frontend
   ```

3. Set the required secrets:
   ```bash
   flyctl secrets set NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   flyctl secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   flyctl secrets set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   # Add any other secrets your application needs
   ```

4. Deploy the application:
   ```bash
   flyctl deploy
   ```

## Troubleshooting

### Common Issues

1. **Deployment Fails Due to Environment Variables**:
   - Make sure all required environment variables are set as Fly.io secrets
   - Check the logs with `flyctl logs`

2. **Build Process Fails**:
   - Check that the Docker build process works locally with:
     ```bash
     docker build -t doit4theink-frontend .
     ```

3. **App Starts But Shows Blank Screen or Errors**:
   - Check for runtime errors in the logs with `flyctl logs`
   - Ensure all environment variables are correctly set

### Debugging

To view the logs of your application:
```bash
flyctl logs
```

To SSH into your running app for deeper debugging:
```bash
flyctl ssh console
```

## Environment Management

### Adding More Environment Variables

If you need to add more environment variables to your deployed app:

1. Add them to the Fly.io secrets:
   ```bash
   flyctl secrets set NEW_ENV_VARIABLE=value
   ```

2. Update the Dockerfile to include these variables in the build process:
   ```dockerfile
   ARG NEW_ENV_VARIABLE
   ENV NEW_ENV_VARIABLE=$NEW_ENV_VARIABLE
   ```

3. Update the GitHub workflow (.github/workflows/fly.yml) to pass these variables:
   ```yaml
   env:
     NEW_ENV_VARIABLE: ${{ secrets.NEW_ENV_VARIABLE }}
   ```

### Viewing Current Secrets

To list all current secrets:
```bash
flyctl secrets list
```

## Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Dockerizing Next.js Applications](https://nextjs.org/docs/deployment#docker-image)

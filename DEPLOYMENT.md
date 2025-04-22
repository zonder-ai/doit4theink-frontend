# Deploying DoIt4TheInk to Fly.io

This document explains how to deploy the DoIt4TheInk frontend to Fly.io using Heroku buildpacks.

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

3. Set the required secrets as environment variables:
   ```bash
   flyctl secrets set NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
                     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
                     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. Deploy the application:
   ```bash
   flyctl deploy
   ```

## Key Configuration Files

### fly.toml

The `fly.toml` file contains the configuration for your Fly.io application. It specifies:

- Application name
- Region
- Build configuration (uses Heroku buildpacks)
- Environment variables
- Service configuration

### Procfile

The `Procfile` tells the Heroku buildpack how to run your application. It contains:

```
web: npm start
```

This runs the `start` script defined in your package.json.

### .buildpacks

The `.buildpacks` file specifies which buildpacks to use for deployment. It contains:

```
https://github.com/heroku/heroku-buildpack-nodejs.git
```

This tells Fly.io to use the official Heroku Node.js buildpack.

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
- [Heroku Buildpacks Documentation](https://devcenter.heroku.com/articles/buildpacks)

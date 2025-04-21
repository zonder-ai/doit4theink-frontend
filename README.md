# DoIt4TheInk - Tattoo Artist Marketplace

A platform connecting tattoo artists, studios, and clients in a unified ecosystem. The platform facilitates tattoo artist discovery, design browsing, appointment scheduling, and payment processing.

## Tech Stack

- **Frontend**: Next.js with App Router
- **UI Components**: Shadcn UI (Tailwind CSS)
- **Authentication & Database**: Supabase
- **Payments**: Stripe

## Features

- Multiple user types: clients, artists, studio owners
- Comprehensive profile management
- Design catalog with advanced filtering
- Artist & studio discovery
- Intelligent appointment scheduling
- Deposit and payment processing
- Reviews and messaging system

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your Supabase and Stripe credentials
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app router pages
- `/components` - Reusable UI components
- `/lib` - Utility functions and configurations
- `/public` - Static assets

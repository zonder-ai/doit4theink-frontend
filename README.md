# DoIt4TheInk - Tattoo Artist Marketplace

A platform connecting tattoo artists, studios, and clients in a unified ecosystem. The platform facilitates tattoo artist discovery, design browsing, appointment scheduling, and payment processing.

![DoIt4TheInk Screenshot](/public/screenshot.png)

## Features

- **User Authentication**: Sign up, login, and profile management
- **Artist Profiles**: Comprehensive profiles for tattoo artists with portfolios
- **Studio Management**: Studio pages with artist listings and location information
- **Design Catalog**: Browse tattoo designs with advanced filtering
- **Booking System**: Schedule appointments with deposit payments via Stripe
- **Search Functionality**: Find designs, artists, and studios
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **UI Components**: Shadcn UI with Tailwind CSS
- **Authentication & Database**: Supabase
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account with project setup
- Stripe account (for payment processing)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zonder-ai/doit4theink-frontend.git
cd doit4theink-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root of the project and add your Supabase and Stripe credentials:

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://fmkzfzlujrmwipkoubmm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key
STRIPE_SECRET_KEY=your-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
doit4theink-frontend/
├── app/                 # Next.js App Router pages
│   ├── artists/         # Artist related pages
│   ├── auth/            # Authentication pages
│   ├── booking/         # Booking flow pages
│   ├── dashboard/       # User dashboard
│   ├── designs/         # Design catalog and details
│   ├── profile/         # Profile management
│   ├── search/          # Search functionality
│   ├── studios/         # Studio related pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Homepage
├── components/          # Reusable components
│   ├── ui/              # UI components from Shadcn
│   ├── artist-card.tsx  # Artist card component
│   ├── design-card.tsx  # Design card component
│   ├── navigation.tsx   # Navigation bar
│   ├── studio-card.tsx  # Studio card component
│   └── theme-provider.tsx # Theme provider
├── lib/                 # Utility functions and configurations
│   ├── supabase.ts      # Supabase client and API functions
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── types/               # TypeScript type definitions
    └── supabase.ts      # Supabase database types
```

## Database Schema

The database is hosted on Supabase and has the following main tables:

- **profiles**: Base user profiles
- **client_profiles**: Extended information for clients
- **artist_profiles**: Extended information for artists
- **studios**: Information about tattoo studios
- **designs**: Tattoo designs available for booking
- **bookings**: Appointment bookings
- **payments**: Payment records

For a complete schema, refer to the backend documentation.

## Supabase Setup

The platform relies on Supabase for authentication, database, and storage. To set up the required tables and functions, refer to the backend documentation or run the migration scripts provided.

## Stripe Integration

Payment processing is handled through Stripe. To fully test the booking functionality:

1. Set up a Stripe account and obtain your API keys
2. Add the keys to your `.env.local` file
3. Configure the Stripe webhook to point to your local development server or deployed application

## Deployment

This application can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or AWS.

Example deployment to Vercel:

```bash
npm install -g vercel
vercel login
vercel
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)

# DoIt4TheInk Frontend

A platform connecting tattoo artists, studios, and clients in a unified ecosystem. This web application facilitates tattoo artist discovery, design browsing, appointment scheduling, and payment processing.

## 🎯 Features

- **User Authentication**: Secure login/registration with Supabase Auth
- **Profile Management**: Create and manage profiles for clients, artists, and studios
- **Design Browsing**: Search and filter through tattoo designs by style, price, location, etc.
- **Booking System**: Schedule appointments with integrated calendar functionality
- **Payment Processing**: Secure deposit payments with Stripe integration
- **Artist Portfolios**: Showcases for artist work and availability
- **Studio Management**: Features for studio owners to manage artists and bookings

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Payments**: Stripe
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod

## 📂 Project Structure

```
app/
├── auth/                    # Authentication pages
│   ├── signin/              # Sign in page
│   ├── signup/              # Sign up page
│   └── callback/            # Auth callback handling
├── dashboard/               # User dashboard
├── designs/                 # Design browsing and details
│   └── [id]/                # Individual design page
├── artists/                 # Artist browsing and profiles
│   └── [id]/                # Individual artist page
├── studios/                 # Studio browsing and profiles
│   └── [id]/                # Individual studio page
├── profile/                 # Profile management
│   └── create/              # Profile creation flow
│       ├── client/          # Client profile creation
│       ├── artist/          # Artist profile creation
│       └── studio/          # Studio profile creation
├── booking/                 # Booking flow
│   ├── confirm/             # Booking confirmation
│   └── payment-success/     # Payment success page
└── api/                     # API routes

components/                  # Reusable UI components
├── ui/                      # shadcn/ui components
└── ...                      # Custom components

lib/                         # Utility functions and services
├── supabase.ts              # Supabase client and data fetching functions
└── ...                      # Other utilities

types/                       # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account and project
- Stripe account (for payments)

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

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📝 Current Progress

### Completed
- ✅ User authentication setup with Supabase
- ✅ Basic UI components and layout with shadcn/ui
- ✅ Profile creation flow for clients, artists, and studios
- ✅ Design browsing and filtering
- ✅ Design detail pages
- ✅ Booking confirmation flow
- ✅ Payment success page

### In Progress
- 🔄 Artist profile pages
- 🔄 Studio profile pages
- 🔄 User dashboard enhancements
- 🔄 Stripe integration for payments

### To Do
- Favorites/bookmarking system
- Messaging between clients and artists
- Reviews and ratings
- Calendar integrations for availability
- Email notifications system
- Mobile responsiveness enhancements
- Admin dashboard for platform management
- Analytics and reporting features
- Search engine optimization
- User settings and preferences

## 🔧 Development

### File Structure Conventions

- **Pages**: Each route in the application has its own directory in the `app` folder with a `page.tsx` file
- **Components**: Reusable components are placed in the `components` directory
- **Hooks**: Custom React hooks are placed in the `lib/hooks` directory
- **Utilities**: Utility functions are placed in the `lib` directory
- **Types**: TypeScript type definitions are placed in the `types` directory

### Code Style

- Follow ESLint and TypeScript rules
- Use functional components with hooks
- Use shadcn/ui components where possible
- Follow the Tailwind CSS utility-first approach

### Environment Setup

The application relies on the following services:

1. **Supabase**: Backend as a service for authentication, database, and storage
   - Database tables for users, designs, bookings, etc.
   - Storage buckets for profile images, design images, etc.
   - Authentication service for user sign up, sign in, etc.

2. **Stripe**: Payment processing for booking deposits
   - Payment Intents API for handling payments
   - Connect API for managing payouts to artists and studios

## 🌐 API Integration

### Supabase

The application uses the following Supabase features:

- **Auth**: For user authentication
- **Database**: For storing and retrieving data
- **Storage**: For storing and retrieving images

### Stripe

The application uses the following Stripe features:

- **Checkout API**: For processing booking deposits
- **Connect API**: For handling payouts to artists and studios

## 📦 Deployment

The application can be deployed on various platforms such as Vercel, Netlify, or AWS Amplify.

### Vercel Deployment (Recommended)

1. Create a Vercel account and link it to your GitHub repository
2. Configure the environment variables in the Vercel dashboard
3. Deploy the application

### Netlify Deployment

1. Create a Netlify account and link it to your GitHub repository
2. Configure the environment variables in the Netlify dashboard
3. Deploy the application

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/docs)
- [Zod Documentation](https://zod.dev)

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.io)
- [Stripe](https://stripe.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

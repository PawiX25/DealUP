# DealUp - Deal Sharing Platform

DealUp is a modern web application that allows users to discover, share, and discuss the best deals online. Built with Next.js 13+, TypeScript, Prisma, and Tailwind CSS, it features real-time deal scraping, user authentication, and a responsive design.

## Features

- 🔐 Google Authentication
- 🔍 Automatic deal scraping from product URLs
- 💬 Comments system
- 🎯 Store detection and filtering
- 📱 Responsive design
- 👤 User profiles

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Framer Motion
- **Data Fetching**: Server Components + API Routes
- **Web Scraping**: Cheerio
- **Date Handling**: Moment.js


## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```env
   DATABASE_URL="file:./dev.db"
   GOOGLE_ID=your_google_client_id
   GOOGLE_SECRET=your_google_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Features in Detail

### Deal Creation
- Paste a product URL to auto-fill deal details
- Automatic price and image extraction
- Manual editing capabilities
- Support for comparison pricing

### Deal Discovery
- Browse all shared deals
- Filter by store or search terms
- Sort by newest first
- View deal details and discussions

### User System
- Google authentication
- User profiles
- Deal history
- Comment management

### UI/UX
- Responsive design for all devices
- Smooth animations with Framer Motion
- Loading states and error handling

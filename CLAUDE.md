# DriveEase - Car Rental Website

## Project Overview
DriveEase is a modern, full-featured car rental website built with Next.js 15, TypeScript, and Firebase. It includes a public-facing website for customers and a comprehensive admin dashboard for managing vehicles, bookings, and payments.

## Tech Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **UI Components**: Lucide React, Headless UI
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Time/Date Utilities**: Date-fns

## Project Structure

```
src/
├── app/
│   ├── (website)/           # Public website routes
│   │   ├── layout.tsx       # Website layout with Navbar and Footer
│   │   └── page.tsx         # Homepage
│   ├── admin/               # Admin dashboard routes
│   │   ├── layout.tsx       # Admin layout with sidebar
│   │   ├── login/
│   │   │   └── page.tsx     # Admin login page
│   │   ├── dashboard/
│   │   │   └── page.tsx     # Admin dashboard
│   │   ├── cars/
│   │   │   └── page.tsx     # Car management
│   │   ├── packages/
│   │   │   └── page.tsx     # Package management
│   │   ├── bookings/
│   │   │   └── page.tsx     # Booking management
│   │   ├── payments/
│   │   │   └── page.tsx     # Payment management
│   │   └── settings/
│   │       └── page.tsx     # Admin settings
│   ├── globals.css          # Global Tailwind CSS
│   └── layout.tsx           # Root layout
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx # Sidebar navigation
│   │   └── AdminHeader.tsx  # Page header
│   └── website/
│       ├── Navbar.tsx       # Public website navbar
│       └── Footer.tsx       # Public website footer
├── context/
│   └── AdminAuthContext.tsx # Admin authentication context
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   └── collections.ts       # Firestore collection names
├── types/
│   └── index.ts             # TypeScript interfaces
└── middleware.ts            # Route protection middleware
```

## Environment Variables
Create a `.env.local` file with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary Configuration (for image storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# JazzCash Configuration (payment gateway)
NEXT_PUBLIC_JAZZCASH_MERCHANT_ID=
NEXT_PUBLIC_JAZZCASH_PASSWORD=
NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT=
```

## Firebase Setup
1. Create a new Firebase project called "DriveEase-Rental" at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. ~~Create a Storage bucket~~  (Optional - Cloudinary is now used by default)
5. Copy the Firebase config values to `.env.local`

## Cloudinary Setup (Alternative Image Storage)

The app now uses **Cloudinary** for image storage instead of Firebase Storage. This provides better reliability and performance.

### Steps to Set Up Cloudinary:

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Navigate to your Dashboard

2. **Get Your Cloud Name**
   - On the Dashboard, you'll see your "Cloud Name" displayed prominently
   - Copy this value

3. **Create an Upload Preset**
   - Go to Settings (gear icon) → Upload → Upload presets
   - Click "Add upload preset"
   - Set:
     - **Name**: `driveease-cars` (or any name you prefer)
     - **Unsigned**: Toggle ON (allows uploads without server-side authentication)
     - **Folder**: `driveease` (optional, for organizing uploads)
   - Click "Save"
   - Copy the preset name

4. **Add to `.env.local`**
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=driveease-cars
   ```

5. **Test the Setup**
   - Start the dev server: `npm run dev`
   - Go to Admin Dashboard → Cars
   - Click "+ Add Car" and upload an image
   - Check browser DevTools Console for `[CLOUDINARY]` logs
   - If successful, image URL will be stored in Firestore

### Why Cloudinary?
- ✅ **Reliable**: Enterprise-grade image hosting
- ✅ **Free Tier Generous**: 25 GB storage + 25 GB bandwidth per month
- ✅ **Easy Setup**: No server-side authentication needed
- ✅ **Automatic Optimization**: Images are auto-optimized for web
- ✅ **Fast Delivery**: CDN-backed global distribution
- ✅ **No Firebase Storage Quotas**: Unlimited image uploads (within free tier)

## Firestore Collections

### cars
- carId
- name
- brand
- model
- year
- price (per day in PKR)
- images
- category (sedan, suv, luxury, van, coaster)
- seats
- transmission (automatic, manual)
- fuel (petrol, diesel, hybrid)
- features
- available
- description
- createdAt

### packages
- packageId
- name
- description
- cars (array of carIds)
- duration
- pricePerDay
- discount
- features
- image
- popular
- available
- createdAt

### bookings
- bookingId
- customerName
- customerPhone
- customerEmail
- customerId (optional)
- carId
- carName
- carImage
- packageId (optional)
- packageName (optional)
- startDate
- endDate
- totalDays
- totalAmount
- paymentMethod (cash, jazzcash)
- paymentStatus (pending, paid, failed, refunded)
- txnRefNo (optional)
- bookingStatus (confirmed, active, completed, cancelled)
- pickupLocation
- dropoffLocation
- notes
- createdAt

### admins
- uid
- email
- fullName
- role (admin)
- createdAt

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Routes

### Public Routes
- `/` - Homepage
- `/#cars` - Cars section
- `/#packages` - Packages section
- `/#about` - About section
- `/#contact` - Contact section

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Dashboard (protected)
- `/admin/cars` - Car management (protected)
- `/admin/packages` - Package management (protected)
- `/admin/bookings` - Booking management (protected)
- `/admin/payments` - Payment management (protected)
- `/admin/settings` - Settings (protected)

## Key Components

### AdminAuthContext
Provides authentication state management for admin users. Verifies that logged-in users have admin role in the database.

### AdminSidebar
Navigation menu for admin dashboard with logout functionality.

### AdminHeader
Page header with notifications and user info.

### Navbar
Sticky navigation bar for public website with mobile hamburger menu.

### Footer
Dark footer with links, social media, and floating WhatsApp button.

## Authentication Flow
1. Admin enters credentials on login page
2. Firebase authenticates the user
3. AdminAuthContext checks if user exists in ADMINS collection
4. If authorized, user is logged in and redirected to dashboard
5. Protected routes check for authenticated admin user

## Future Development
- Complete car management interface
- Complete package management interface
- Booking system with calendar
- Payment integration (JazzCash)
- User authentication for customers
- Booking history and management
- Reviews and ratings system
- Email notifications
- SMS notifications
- Advanced analytics dashboard

## Notes
- This is a separate Firebase project from TOSMS
- All environment variables must be prefixed with NEXT_PUBLIC_ for client-side access
- The admin layout is wrapped with AdminAuthProvider for authentication
- Toast notifications are integrated globally via react-hot-toast

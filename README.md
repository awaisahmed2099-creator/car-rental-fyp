# DriveEase — Premium Car Rental Platform

## Overview
DriveEase is a full-stack luxury car rental platform built with Next.js 15, Firebase, and Tailwind CSS. Features a dark luxury themed public website with admin dashboard.

## Tech Stack
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- Backend: Firebase (Firestore, Auth, Storage)
- Payment: JazzCash integration
- Deployment: Vercel

## Local Setup
1. Clone repository: `git clone https://github.com/yourusername/driveease`
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env.local`
4. Fill in environment variables (see below)
5. Run development server: `npm run dev`

## Environment Variables
Create .env.local with:
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_JAZZCASH_MERCHANT_ID=
NEXT_PUBLIC_JAZZCASH_PASSWORD=
NEXT_PUBLIC_JAZZCASH_INTEGRITY_SALT=

## Firebase Setup
1. Create project at console.firebase.google.com named 'DriveEase-Rental'
2. Enable Authentication (Email/Password)
3. Create Firestore database (asia-south1 region)
4. Enable Storage
5. Register web app and copy config to .env.local
6. Deploy security rules: `firebase deploy --only firestore:rules`

## Create Admin Account
1. Go to Firebase Console → Authentication → Add User
2. Create email/password user
3. Copy the UID
4. Go to Firestore → Create collection 'admins'
5. Create document with ID = copied UID (any field e.g. role: 'admin')
6. Login at /admin/login with those credentials

## JazzCash Integration
1. Register at jazz.com.pk/business/jazzcash
2. Get sandbox credentials for testing
3. Add credentials to .env.local
4. Test with sandbox before going live
5. Switch to production credentials before deployment

## Deployment to Vercel
1. Push code to GitHub
2. Connect repo at vercel.com
3. Add all environment variables in Vercel dashboard
4. Deploy automatically on push to main branch
OR manual: `npx vercel --prod`

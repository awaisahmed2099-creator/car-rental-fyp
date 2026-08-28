# DriveEase - Full-Stack Car Rental Management System

DriveEase is a comprehensive and scalable car rental platform built as a Final Year Project (FYP). It features a fully mobile-responsive public storefront for customers to browse vehicles and book rentals, paired with a powerful Admin Dashboard for seamless inventory, booking, and user management.

## 🚀 Key Features

*   **Public Storefront:** A modern, mobile-first UI tailored for users to explore car listings, view custom rental packages, and subscribe to newsletters.
*   **Admin Dashboard:** A secure, dedicated portal for administrators to manage car inventory, track active/past bookings, review user feedback, and monitor revenue metrics.
*   **Seamless Booking & Payments:** Integrated with Stripe for highly secure, real-time online checkout and payment processing.
*   **Real-Time Database:** Powered by Firebase Firestore, utilizing optimized long-polling to guarantee stable, real-time data synchronization across all devices.
*   **Automated Image Optimization:** Direct client-side media uploads using Cloudinary (Unsigned Mode) for lightning-fast image processing and delivery.
*   **Interactive Mapping:** Integrated Leaflet maps to facilitate precise location picking and drop-off coordination for users.

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
*   **Backend/Database:** Firebase (Firestore, Auth)
*   **Payment Gateway:** Stripe API
*   **Media Storage & CDN:** Cloudinary
*   **Mapping:** Leaflet.js
*   **Deployment:** Vercel (CI/CD Pipeline)

## ⚙️ Environment Variables

To run this project locally, create a `.env.local` file in the root directory and configure the following required keys:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=driveease-cars

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

💻 Local Installation
Clone the repository:

git clone <your-repo-url>
Navigate into the project directory and install dependencies:

cd car-rental-fyp
npm install
Start the development server:

npm run dev
Open http://localhost:3000 in your browser to view the application.

🚢 Deployment
This project is configured for continuous integration and deployment (CI/CD) via Vercel. Pushing code to the main branch on GitHub automatically triggers a new production build, ensuring the live site is always up to date.

##GitHub

How to Update and Push Code (GitHub)

To save your changes and push them to the repository, follow these steps:

1. **Make Changes:** Open your project files in VS Code, make your desired updates, and save them.
2. **Open Terminal:** Open the integrated terminal in VS Code.
3. **Run Git Commands:** Execute the following commands to stage, commit, and push your code:

   ```bash
   # 1. Stage all modified files
   git add .

   # 2. Commit your changes with a clear message
   git commit -m "Update: describe your changes here"

   # 3. Push the code to the main branch
   git push origin main

##Deployment (Vercel)

This project is fully integrated with **Vercel** for automatic CI/CD deployments. 

**Steps to Deploy:**
1. Create a free account on [Vercel](https://vercel.com/) and connect your GitHub account.
2. Click on **Add New Project** and import the `car-rental-fyp` repository.
3. In the Configuration settings, add all the environment variables from your `.env.local` file.
4. Click **Deploy**.

### Manual Deployment via Vercel CLI

If you prefer to deploy your code directly from your terminal without pushing to GitHub, you can use the Vercel Command Line Interface (CLI):

1. **Install the Vercel CLI** (Only required once):
   npm i -g vercel
   
2. **Log in to your Vercel account:**
   vercel login

3. **Deploy to production:**
   vercel --prod
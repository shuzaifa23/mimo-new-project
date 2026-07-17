# MIMO Vision Print Platform

A modern online printing and Xerox partner platform designed for students and local print shops.

## Features

- **Student Module**:
  - Document upload (PDF/DOC).
  - Print configuration (Color/B&W, Copies, Binding).
  - Partner shop selection.
  - Real-time order tracking (via dashboard).

- **Partner System**:
  - Onboarding for new Xerox/print shops.

## Tech Stack

- **Frontend**: Next.js 15+, React 19, Tailwind CSS.
- **Backend**: Firebase (Firestore for data, Storage for files).
- **PDF Handling**: `pdf-lib` for generation and manipulation.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Folder Structure

- `/app`: Next.js App Router (Student, Dashboard, Partner routes).
- `/components`: Reusable UI components.
- `/lib`: Utility functions (Firebase, PDF logic).
- `/public`: Static assets.

## License

MIT

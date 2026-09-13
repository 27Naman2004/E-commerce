# Kanha Collection - E-Commerce For Laddu Gopal Ji

A complete MERN stack e-commerce application built for devotional products. 

## Features
- **Frontend**: React (Vite) + Tailwind CSS v4 + Redux Toolkit
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT with httpOnly cookies
- **Payments**: Razorpay Integration
- **File Uploads**: Cloudinary
- **Emails**: Nodemailer
- **Design**: Fully responsive, Custom UI tokens, Framer Motion animations

## Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)
- Cloudinary Account
- Razorpay Account
- Gmail app password for Nodemailer (Optional)

## Local Development Setup

### 1. Backend Setup
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and fill in your keys:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pwd>@cluster...
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=your_rzp_key
RAZORPAY_KEY_SECRET=your_rzp_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

**Seed the Database**
To get started with sample products and an admin user:
```bash
npm run seed:users
npm run seed:products
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
```
Copy `.env.example` to `.env` (or create it):
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Visit `http://localhost:5173`

## Deployment

### Backend (Render/Heroku/Vercel)
Set the environment variables in your hosting provider. Make sure `FRONTEND_URL` is set to your production frontend URL.

### Frontend (Vercel/Netlify)
Set `VITE_API_URL` to your production backend URL.
Build command: `npm run build`
Output directory: `dist`

## Test Accounts
- **Admin**: `admin@kanhacollection.com` / `123456`
- **User**: `user@kanhacollection.com` / `123456`

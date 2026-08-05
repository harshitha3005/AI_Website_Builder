
# AI Website Builder

AI Website Builder is a full-stack application that generates responsive, production-ready websites using AI. It combines Google-based authentication, a React/Vite frontend, a Node.js/Express backend, and Razorpay for payments.

## Project Overview

This project allows users to:
- Sign in with Google authentication
- Generate websites using AI prompts
- Preview generated websites in a dashboard
- Deploy and share live website previews
- Purchase extra credits via Razorpay payments

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: Firebase Google sign-in with server-side JWT cookies
- Payments: Razorpay order creation and hosted payment links
- AI Model: OpenRouter `deepseek/deepseek-chat`

## AI Model

The website generation uses `deepseek/deepseek-chat` via OpenRouter. The backend sends a rich prompt to this model and extracts HTML/CSS/JS output for a complete single-page website.

## Features

- Google login and logout
- Protected dashboard for user websites
- AI generation of full responsive website code
- Credit-based usage tracking
- Razorpay payment integration for plan upgrades
- Live preview and deployable website preview links

## Getting Started

1. Install dependencies in both `backend` and `frontend`:
   - `npm install`
2. Start the backend server:
   - `cd backend`
   - `npm run dev`
3. Start the frontend app:
   - `cd frontend`
   - `npm run dev`
4. Set environment variables in the `backend/.env` and `frontend/.env` files.

## Environment Variables

Required backend variables:
- `SECRET_KEY`
- `MONGO_URI`
- `OPENROUTER_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_SECRET`
- `FRONTEND_URL`

Required frontend variables:
- `VITE_SERVER_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_RAZORPAY_KEY_ID`

## Notes

- The AI prompt is configured to generate complete HTML/CSS/JS websites using only client-side code.
- The app stores session tokens in cookies and local storage for cross-origin auth support.
- Razorpay is used for secure payment processing and credit top-ups.

## License

This project is for learning and prototyping AI-driven website creation.

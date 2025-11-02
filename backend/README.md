
RESTful API for TrustSave - A savings group management platform with SMS/WhatsApp invitation capabilities.

Built With

Node.js & Express.js - Server framework
MongoDB & Mongoose - Database
JWT- Authentication
Twilio - SMS/WhatsApp messaging
bcryptjs - Password encryption

Prerequisites

Node.js (v14+)
MongoDB Atlas account
Twilio account (for SMS features)

Quick Start

Install dependencies
   ```bash
   npm install
   ```

Set up environment variables
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Fill in your credentials:
   ```properties
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trustsave
   JWT_SECRET=your_long_random_secret_key_here
   NODE_ENV=development
   
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=+1234567890
   
   FRONTEND_URL=http://localhost:5173
   ```

Start the server
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   Server runs on `http://localhost:5000`

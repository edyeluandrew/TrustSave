# TrustSave Frontend 

Modern React frontend for TrustSave - Manage your savings groups with ease.

Built With

- React- UI library
- Vite - Build tool & dev server
- React Router - Navigation
- Axios - HTTP client
- Tailwindcss- Styling

Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend server running

 Quick Start

1. Install dependencies
   ```bash
   npm install
   ```

2. Set up environment variables
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Update with your backend API URL:
   ```properties
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start development server
   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173`

4. Build for production
   ```bash
   npm run build
   ```

   Production files will be in the `dist/` folder.
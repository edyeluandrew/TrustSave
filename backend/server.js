import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import Invitation from './models/Invitation.js';

// Import routes
import authRoutes from './routes/auth.js';
import groupsRoutes from './routes/groups.js';
import dashboardRoutes from './routes/dashboard.js';
import invitationsRoutes from './routes/invitations.js';
import joinRequestsRoutes from './routes/joinRequests.js';

// ES modules dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// SERVE FRONTEND STATIC FILES
// ============================================
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log('📁 Frontend path:', frontendPath);

// Serve static files from frontend/dist
app.use(express.static(frontendPath));

// ============================================
// API ROUTES (must come BEFORE frontend catch-all)
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/invitations', invitationsRoutes);
app.use('/api/join-requests', joinRequestsRoutes);

// ============================================
// BASIC API ROUTES
// ============================================
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TrustSave API is running!',
    endpoints: {
      auth: '/api/auth',
      groups: '/api/groups',
      dashboard: '/api/dashboard',
      invitations: '/api/invitations',
      joinRequests: '/api/join-requests'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============================================
// SPECIAL ROUTE: Handle /invite/:id from SMS
// This serves the frontend app which handles the invite
// ============================================
app.get('/invite/:invitationId', async (req, res) => {
  try {
    const { invitationId } = req.params;
    
    console.log('📨 SMS invite link clicked:', invitationId);
    
    // Verify invitation exists (optional - let frontend handle)
    try {
      const invitation = await Invitation.findById(invitationId);
      if (invitation) {
        console.log('✅ Invitation found, serving frontend');
      } else {
        console.log('⚠️ Invitation not found, but serving frontend anyway');
      }
    } catch (err) {
      console.log('⚠️ Error checking invitation, serving frontend anyway');
    }
    
    // Serve the frontend app - React Router will handle /invite/:id
    res.sendFile(path.join(frontendPath, 'index.html'));
    
  } catch (error) {
    console.error('❌ Error handling invite route:', error);
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

// ============================================
// FRONTEND CATCH-ALL (must be LAST)
// Serve frontend for all non-API routes
// ============================================
app.get('*', (req, res) => {
  // Only serve frontend for non-API routes
  if (!req.path.startsWith('/api')) {
    console.log('🎨 Serving frontend for:', req.path);
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    // API route not found
    console.log('❌ API route not found:', req.path);
    res.status(404).json({
      success: false,
      error: 'API route not found',
      path: req.path
    });
  }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 TrustSave server running on port ${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend: Served from backend`);
  console.log(`📱 SMS invites: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log('========================================\n');
});
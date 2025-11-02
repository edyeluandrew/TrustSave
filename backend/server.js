import 'dotenv/config';  // ← Must be first line
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import groupsRoutes from './routes/groups.js';
import dashboardRoutes from './routes/dashboard.js';
import invitationsRoutes from './routes/invitations.js';
import joinRequestsRoutes from './routes/joinRequests.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/invitations', invitationsRoutes);
app.use('/api/join-requests', joinRequestsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'TrustSave API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TrustSave server running on port ${PORT}`);
});
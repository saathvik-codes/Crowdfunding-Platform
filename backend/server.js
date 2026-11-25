require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { startDeadlineChecker, processExpiredCampaigns } = require('./services/deadlineChecker');

// Initialize database (this will create tables with wallet support)
require('./database/db');
require('./database/extensions');

// Import routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const pledgeRoutes = require('./routes/pledges');
const transactionRoutes = require('./routes/transactions');
const walletRoutes = require('./routes/wallet');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://crowdfunding-helper.netlify.app', // Your old Netlify deployment
    process.env.FRONTEND_URL // New Vercel URL from environment variables
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Expired campaigns are settled by a daily cron call and, between calls, whenever campaigns are listed (throttled)
let lastSweep = 0;
const sweep = () => { if (Date.now() - lastSweep > 60000) { lastSweep = Date.now(); processExpiredCampaigns().catch(() => {}); } };
app.get('/api/cron/deadlines', async (req, res) => {
  if (!process.env.CRON_SECRET || req.header('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  await processExpiredCampaigns();
  res.json({ ok: true });
});
app.use('/api/campaigns', (req, res, next) => { if (req.method === 'GET' && process.env.VERCEL) sweep(); next(); });



// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Crowdfunding API is running',
    timestamp: new Date().toISOString()
  });
});

// Test Routes
if (process.env.NODE_ENV !== 'production') app.use('/api/test', require('./routes/testDashboard'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/community'));
app.use('/api/campaigns', campaignRoutes);
app.use('/api/pledges', pledgeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Crowdfunding API listening on http://localhost:${PORT}`);
    startDeadlineChecker();
  });
}


// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

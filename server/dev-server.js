import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imagekitAuthHandler from './imagekit-auth.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Global error handlers
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ImageKit auth endpoint - wrap the handler
app.get('/api/imagekit-auth', async (req, res) => {
  try {
    await imagekitAuthHandler(req, res);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.options('/api/imagekit-auth', (req, res) => {
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📸 ImageKit auth endpoint: http://localhost:${PORT}/api/imagekit-auth`);
});

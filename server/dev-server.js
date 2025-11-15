import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import imagekitAuthHandler from './imagekit-auth.js';
import imagekitUploadHandler from './imagekit-upload.js';
import imagekitDeleteHandler from './imagekit-delete.js';

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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ImageKit auth endpoint
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

// ImageKit upload endpoint
app.post('/api/imagekit-upload', upload.single('file'), async (req, res) => {
  try {
    await imagekitUploadHandler(req, res);
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.options('/api/imagekit-upload', (req, res) => {
  res.status(200).end();
});

// ImageKit delete endpoint
app.post('/api/imagekit-delete', async (req, res) => {
  try {
    await imagekitDeleteHandler(req, res);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.options('/api/imagekit-delete', (req, res) => {
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📸 ImageKit auth endpoint: http://localhost:${PORT}/api/imagekit-auth`);
  console.log(`📤 ImageKit upload endpoint: http://localhost:${PORT}/api/imagekit-upload`);
  console.log(`🗑️  ImageKit delete endpoint: http://localhost:${PORT}/api/imagekit-delete`);
});

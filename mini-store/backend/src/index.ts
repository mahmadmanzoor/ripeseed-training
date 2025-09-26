import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'], // Allow frontend ports
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/health', (request: express.Request, response: express.Response) => {
  response.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Mini Store backend is running'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Mini Store backend server running on port ${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
});

export default app;

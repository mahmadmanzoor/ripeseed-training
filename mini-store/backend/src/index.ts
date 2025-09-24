import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (request, response) => {
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

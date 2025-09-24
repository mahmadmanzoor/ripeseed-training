import express from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { DEFAULT_WALLET_CREDIT } from '../config/constants';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', async (request, response) => {
  try {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      response.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      response.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        walletBalance: DEFAULT_WALLET_CREDIT
      }
    });

    // Generate JWT token
    const token = generateToken(newUser.id);

    response.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        walletBalance: Number(newUser.walletBalance)
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      response.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      response.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      response.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    response.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        walletBalance: Number(user.walletBalance)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase product
router.post('/purchase', authenticateToken, async (request: AuthenticatedRequest, response) => {
  try {
    const { productId, quantity = 1 } = request.body;
    const userId = request.userId;

    // Validate input
    if (!productId || !quantity || quantity < 1) {
      response.status(400).json({ error: 'Product ID and valid quantity are required' });
      return;
    }

    // Get product details from DummyJSON API
    const productResponse = await fetch(`https://dummyjson.com/products/${productId}`);
    if (!productResponse.ok) {
      response.status(404).json({ error: 'Product not found' });
      return;
    }

    const product: any = await productResponse.json();
    
    // Calculate total price with discount
    const discountPrice = product.price - (product.price * (product.discountPercentage || 0)) / 100;
    const totalAmount = discountPrice * quantity;

    // Check if user has sufficient wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      response.status(404).json({ error: 'User not found' });
      return;
    }

    if (Number(user.walletBalance) < totalAmount) {
      response.status(400).json({ 
        error: 'Insufficient wallet balance',
        currentBalance: Number(user.walletBalance),
        requiredAmount: totalAmount
      });
      return;
    }

    // Create order and update wallet balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId: userId!,
          productId: productId,
          quantity,
          totalAmount
        }
      });

      // Update user wallet balance
      const updatedUser = await tx.user.update({
        where: { id: userId! },
        data: {
          walletBalance: Number(user.walletBalance) - totalAmount
        }
      });

      return { order, user: updatedUser };
    });

    response.status(201).json({
      message: 'Purchase successful',
      order: {
        id: result.order.id,
        productId: result.order.productId,
        quantity: result.order.quantity,
        totalAmount: Number(result.order.totalAmount),
        createdAt: result.order.createdAt
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        walletBalance: Number(result.user.walletBalance)
      }
    });

  } catch (error) {
    console.error('Purchase error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

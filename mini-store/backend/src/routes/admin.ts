import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication and admin middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users with their statistics
router.get('/users', async (request: AuthenticatedRequest, response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        walletBalance: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            sentGifts: true,
            receivedGifts: true,
            sentCreditTransfers: true,
            receivedCreditTransfers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      ...user,
      walletBalance: Number(user.walletBalance)
    }));

    response.json({ users: formattedUsers });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders with user details
router.get('/orders', async (request: AuthenticatedRequest, response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount)
    }));

    response.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Get all gifts with sender and receiver details
router.get('/gifts', async (request: AuthenticatedRequest, response) => {
  try {
    const gifts = await prisma.gift.findMany({
      include: {
        sender: {
          select: {
            id: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedGifts = gifts.map(gift => ({
      ...gift,
      totalAmount: Number(gift.totalAmount)
    }));

    response.json({ gifts: formattedGifts });
  } catch (error) {
    console.error('Admin gifts fetch error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Get all credit transfers with sender and receiver details
router.get('/credit-transfers', async (request: AuthenticatedRequest, response) => {
  try {
    const creditTransfers = await prisma.creditTransfer.findMany({
      include: {
        sender: {
          select: {
            id: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCreditTransfers = creditTransfers.map(transfer => ({
      ...transfer,
      amount: Number(transfer.amount)
    }));

    response.json({ creditTransfers: formattedCreditTransfers });
  } catch (error) {
    console.error('Admin credit transfers fetch error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
router.get('/stats', async (request: AuthenticatedRequest, response) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalGifts,
      totalCreditTransfers,
      totalRevenue,
      adminUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.gift.count(),
      prisma.creditTransfer.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.user.count({
        where: { isAdmin: true }
      })
    ]);

    const stats = {
      totalUsers,
      totalOrders,
      totalGifts,
      totalCreditTransfers,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      adminUsers,
      regularUsers: totalUsers - adminUsers
    };

    response.json({ stats });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// Update user admin status
router.patch('/users/:userId/admin-status', async (request: AuthenticatedRequest, response) => {
  try {
    const { userId } = request.params;
    const { isAdmin } = request.body;

    if (typeof isAdmin !== 'boolean') {
      response.status(400).json({ error: 'isAdmin must be a boolean value' });
      return;
    }

    // Prevent user from removing their own admin status
    if (request.userId === userId && !isAdmin) {
      response.status(400).json({ error: 'Cannot remove your own admin privileges' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        walletBalance: true
      }
    });

    response.json({
      message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin successfully`,
      user: {
        ...updatedUser,
        walletBalance: Number(updatedUser.walletBalance)
      }
    });
  } catch (error) {
    console.error('Admin status update error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      response.status(404).json({ error: 'User not found' });
      return;
    }
    response.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

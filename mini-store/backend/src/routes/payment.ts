import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { stripe, STRIPE_CONFIG } from '../config/stripe';

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticateToken);

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (request: AuthenticatedRequest, response) => {
  try {
    console.log('Creating checkout session...');
    const { amount } = request.body;
    const userId = request.userId;

    console.log('Request data:', { amount, userId });

    if (!userId) {
      console.log('No userId found');
      return response.status(401).json({ error: 'User not authenticated' });
    }

    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return response.status(400).json({ error: 'Invalid amount' });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      console.log('User not found in database:', userId);
      return response.status(401).json({ error: 'User not found' });
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);
    console.log('Amount in cents:', amountInCents);

    // Create Stripe Checkout Session
    console.log('Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: 'Wallet Credit Top-up',
              description: `Add $${amount} to your wallet`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      metadata: {
        userId: userId,
        amount: amount.toString(),
      },
    });

    // Store payment record in database
    console.log('Storing payment record...');
    console.log('Session payment_intent:', session.payment_intent);
    
    // Use session ID as payment intent ID if payment_intent is null
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id || session.id;
    
    await prisma.payment.create({
      data: {
        userId: userId,
        stripePaymentIntentId: paymentIntentId,
        amount: amount,
        status: 'pending',
      },
    });

    console.log('Checkout session created successfully:', session.id);
    response.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    response.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not defined');
    return response.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig as string, endpointSecret);
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err);
    return response.status(400).json({ error: 'Invalid signature' });
  }

  try {
    console.log('Webhook event received:', event.type);
    
    if (event.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event...');
      const session = event.data.object;
      console.log('Session data:', {
        id: session.id,
        payment_intent: session.payment_intent,
        metadata: session.metadata
      });
      
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id;
      const amount = parseFloat(session.metadata?.amount || '0');

      console.log('Looking for payment with intent ID:', paymentIntentId);
      console.log('Amount to add:', amount);

      // Update payment status
      const payment = await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: 'succeeded' },
      });

      console.log('Payment updated:', payment);

      // Add credits to user's wallet
      const updatedUser = await prisma.user.update({
        where: { id: payment.userId },
        data: {
          walletBalance: {
            increment: amount,
          },
        },
      });

      console.log(`Payment succeeded: ${amount} credits added to user ${payment.userId}`);
      console.log('New wallet balance:', updatedUser.walletBalance);
    }
  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    return response.status(500).json({ error: 'Webhook processing failed' });
  }

  response.json({ received: true });
});

// Process pending payments manually (for testing)
router.post('/process-pending-payments', async (request: AuthenticatedRequest, response) => {
  try {
    const userId = request.userId;

    if (!userId) {
      return response.status(401).json({ error: 'User not authenticated' });
    }

    // Find all pending payments for this user
    const pendingPayments = await prisma.payment.findMany({
      where: { 
        userId: userId,
        status: 'pending'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Found pending payments:', pendingPayments);

    let totalAmount = 0;
    for (const payment of pendingPayments) {
      // Update payment status to succeeded
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'succeeded' }
      });

      totalAmount += parseFloat(payment.amount.toString());
    }

    if (totalAmount > 0) {
      // Update user's wallet balance
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: totalAmount,
          },
        },
      });

      console.log(`Processed ${pendingPayments.length} pending payments: ${totalAmount} credits added to user ${userId}`);
      console.log('New wallet balance:', updatedUser.walletBalance);

      response.json({ 
        success: true, 
        processedPayments: pendingPayments.length,
        totalAmount: totalAmount,
        newBalance: updatedUser.walletBalance
      });
    } else {
      response.json({ 
        success: true, 
        message: 'No pending payments found',
        processedPayments: 0,
        totalAmount: 0
      });
    }
  } catch (error: unknown) {
    console.error('Error processing pending payments:', error);
    response.status(500).json({ error: 'Failed to process pending payments' });
  }
});

// Manual wallet update for testing (remove in production)
router.post('/manual-update-wallet', async (request: AuthenticatedRequest, response) => {
  try {
    const { amount } = request.body;
    const userId = request.userId;

    if (!userId) {
      return response.status(401).json({ error: 'User not authenticated' });
    }

    if (!amount || amount <= 0) {
      return response.status(400).json({ error: 'Invalid amount' });
    }

    // Update user's wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: amount,
        },
      },
    });

    console.log(`Manual wallet update: ${amount} credits added to user ${userId}`);
    console.log('New wallet balance:', updatedUser.walletBalance);

    response.json({ 
      success: true, 
      newBalance: updatedUser.walletBalance,
      amountAdded: amount 
    });
  } catch (error: unknown) {
    console.error('Error updating wallet:', error);
    response.status(500).json({ error: 'Failed to update wallet' });
  }
});

// Get payment history for user
router.get('/history', async (request: AuthenticatedRequest, response) => {
  try {
    const userId = request.userId;

    if (!userId) {
      return response.status(401).json({ error: 'User not authenticated' });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    response.json(payments);
  } catch (error: unknown) {
    console.error('Error fetching payment history:', error);
    response.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

export default router;

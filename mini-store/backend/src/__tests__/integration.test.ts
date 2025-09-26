import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth';
import paymentRoutes from '../routes/payment';
import { prisma } from './setup';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

describe('Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register a new user for each test
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `integration${Date.now()}@example.com`,
        password: 'password123'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('Complete User Flow', () => {
    it('should handle complete user registration and payment flow', async () => {
      // 1. User registers
      expect(authToken).toBeDefined();
      expect(userId).toBeDefined();

      // 2. User checks their profile
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.user.walletBalance).toBe('1000');

      // 3. User creates a payment session
      const paymentResponse = await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100 })
        .expect(200);

      expect(paymentResponse.body).toHaveProperty('sessionId');
      expect(paymentResponse.body).toHaveProperty('url');

      // 4. Check payment was created in database
      const payments = await prisma.payment.findMany({
        where: { userId: userId }
      });

      expect(payments).toHaveLength(1);
      expect(payments[0].amount.toString()).toBe('100');
      expect(payments[0].status).toBe('pending');

      // 5. User checks payment history
      const historyResponse = await request(app)
        .get('/api/payment/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(historyResponse.body).toHaveLength(1);
      expect(historyResponse.body[0].amount).toBe('100');
    });

    it('should handle multiple payments and wallet updates', async () => {
      // Create multiple pending payments
      await prisma.payment.createMany({
        data: [
          {
            userId: userId,
            stripePaymentIntentId: 'pi_test_1',
            amount: 50,
            status: 'pending'
          },
          {
            userId: userId,
            stripePaymentIntentId: 'pi_test_2',
            amount: 75,
            status: 'pending'
          }
        ]
      });

      // Process all pending payments
      const processResponse = await request(app)
        .post('/api/payment/process-pending-payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(processResponse.body.success).toBe(true);
      expect(processResponse.body.processedPayments).toBe(2);
      expect(processResponse.body.totalAmount).toBe(125);

      // Check final wallet balance
      const finalBalance = parseFloat(processResponse.body.newBalance);
      expect(finalBalance).toBe(1125); // 1000 initial + 125 from payments
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid authentication gracefully', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing authentication for protected routes', async () => {
      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .send({ amount: 50 })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid payment amounts', async () => {
      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: -10 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid amount');
    });
  });

  describe('Database Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Create a payment
      await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 200 })
        .expect(200);

      // Verify payment exists
      const payments = await prisma.payment.findMany({
        where: { userId: userId }
      });

      expect(payments).toHaveLength(1);
      expect(payments[0].amount.toString()).toBe('200');
      expect(payments[0].status).toBe('pending');

      // Process the payment
      await request(app)
        .post('/api/payment/process-pending-payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify payment status updated
      const updatedPayments = await prisma.payment.findMany({
        where: { userId: userId }
      });

      expect(updatedPayments[0].status).toBe('succeeded');
    });
  });
});

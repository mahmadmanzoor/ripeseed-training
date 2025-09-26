import request from 'supertest';
import express from 'express';
import paymentRoutes from '../routes/payment';
import authRoutes from '../routes/auth';
import { prisma } from './setup';

const app = express();
app.use(express.json());
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);

describe('Payment Routes', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `payment-${Date.now()}@example.com`,
        password: 'password123'
      });

    if (registerResponse.status !== 201) {
      throw new Error(`User registration failed: ${JSON.stringify(registerResponse.body)}`);
    }

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /create-checkout-session', () => {
    it('should create a checkout session with valid amount', async () => {
      const paymentData = {
        amount: 50
      };

      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('checkout.stripe.com');
    });

    it('should return 400 for invalid amount', async () => {
      const paymentData = {
        amount: -10
      };

      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid amount');
    });

    it('should return 400 for zero amount', async () => {
      const paymentData = {
        amount: 0
      };

      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid amount');
    });

    it('should return 401 for missing token', async () => {
      const paymentData = {
        amount: 50
      };

      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .send(paymentData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Access token required');
    });

    it('should create payment record in database', async () => {
      const paymentData = {
        amount: 100
      };

      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      // Check if payment record was created
      const payments = await prisma.payment.findMany({
        where: { userId: userId }
      });
      expect(payments).toHaveLength(1);
      expect(payments[0].amount.toString()).toBe('100');
      expect(payments[0].status).toBe('pending');
    });
  });

  describe('GET /history', () => {
    beforeEach(async () => {
      // Create some test payments
      await prisma.payment.createMany({
        data: [
          {
            userId: userId,
            stripePaymentIntentId: 'pi_test_1',
            amount: 50,
            status: 'succeeded'
          },
          {
            userId: userId,
            stripePaymentIntentId: 'pi_test_2',
            amount: 100,
            status: 'pending'
          }
        ]
      });
    });

    it('should return payment history for authenticated user', async () => {
      const response = await request(app)
        .get('/api/payment/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('amount');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/payment/history')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /process-pending-payments', () => {
    beforeEach(async () => {
      // Create pending payments
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
    });

    it('should process pending payments and update wallet', async () => {
      const response = await request(app)
        .post('/api/payment/process-pending-payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('processedPayments', 2);
      expect(response.body).toHaveProperty('totalAmount', 125);
      expect(response.body).toHaveProperty('newBalance');

      // Check if payments were updated to succeeded
      const updatedPayments = await prisma.payment.findMany({
        where: { userId: userId }
      });

      expect(updatedPayments.every(p => p.status === 'succeeded')).toBe(true);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/payment/process-pending-payments')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});

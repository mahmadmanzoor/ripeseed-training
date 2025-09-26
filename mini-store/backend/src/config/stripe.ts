import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/payment/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/payment/cancel',
} as const;

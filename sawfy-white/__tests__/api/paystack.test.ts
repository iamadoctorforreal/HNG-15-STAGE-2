import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/paystack/route';

describe('Paystack Checkout API Route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  it('rejects requests missing required fields with 400', async () => {
    const req = new Request('http://localhost:3000/api/checkout/paystack', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }), // missing amount & orderId
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Missing required parameters');
  });

  it('multiplies NGN amount by 100 to convert to Kobo for Paystack API', async () => {
    let capturedBody: any;
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            status: true,
            data: {
              authorization_url: 'https://checkout.paystack.com/test1234',
              reference: 'SAWFY-test-ref',
            },
          }),
      });
    });

    const req = new Request('http://localhost:3000/api/checkout/paystack', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@sawfywhite.com',
        amount: 18500, // ₦18,500
        orderId: 'ord-12345',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authorization_url).toBe('https://checkout.paystack.com/test1234');
    expect(capturedBody.amount).toBe(1850000); // 1,850,000 kobo
  });
});

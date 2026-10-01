import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/flutterwave/route';

describe('Flutterwave Checkout API Route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.FLW_SECRET_KEY = 'FLWSECK_TEST-mock';
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  it('rejects requests missing required fields with 400', async () => {
    const req = new Request('http://localhost:3000/api/checkout/flutterwave', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('sends standard currency unit (not multiplied by 100) to Flutterwave API', async () => {
    let capturedBody: any;
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { link: 'https://checkout.flutterwave.com/pay/test123' },
          }),
      });
    });

    const req = new Request('http://localhost:3000/api/checkout/flutterwave', {
      method: 'POST',
      body: JSON.stringify({
        email: 'diaspora@example.com',
        amount: 25, // $25 standard units
        currency: 'USD',
        orderId: 'ord-intl-999',
        customerName: 'Abeokuta Diaspora Buyer',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.link).toBe('https://checkout.flutterwave.com/pay/test123');
    expect(capturedBody.amount).toBe(25); // Standard unit!
    expect(capturedBody.currency).toBe('USD');
  });
});

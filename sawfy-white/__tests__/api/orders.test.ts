import { describe, it, expect } from 'vitest';
import { POST, GET } from '@/app/api/orders/route';

describe('Orders API Route', () => {
  it('rejects order with empty items array with 400', async () => {
    const req = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
        shippingAddress: { email: 'customer@test.com' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('at least one item');
  });

  it('calculates domestic Nigerian shipping fee properly', async () => {
    const req = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ title: 'Catfish 1kg', unitPrice: 18500, quantity: 1, isDigital: false }],
        shippingAddress: {
          firstName: 'Adewale',
          email: 'adewale@example.com',
          country: 'Nigeria',
          city: 'Abeokuta',
        },
        currency: 'NGN',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subtotal).toBe(18500);
    expect(body.shippingFee).toBe(2500); // ₦2500 domestic
    expect(body.totalAmount).toBe(21000);
  }, 30000);

  it('charges zero shipping fee for pure digital orders (cookbook)', async () => {
    const req = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ title: 'Digital Cookbook', unitPrice: 2500, quantity: 1, isDigital: true }],
        shippingAddress: {
          firstName: 'Folashade',
          email: 'folashade@example.com',
          country: 'Nigeria',
        },
        currency: 'NGN',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subtotal).toBe(2500);
    expect(body.shippingFee).toBe(0); // Zero shipping for digital
    expect(body.totalAmount).toBe(2500);
  }, 15000);

  it('GET /api/orders rejects without userId or email', async () => {
    const req = new Request('http://localhost:3000/api/orders', {
      method: 'GET',
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('userId or email');
  });
});

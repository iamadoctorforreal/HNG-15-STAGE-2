import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/auth/register/route';

describe('Auth Register API Route', () => {
  it('rejects registration with missing email or password', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
        password: '',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Email and password are required');
  });

  it('rejects registration with password shorter than 6 characters', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('at least 6 characters');
  });
});

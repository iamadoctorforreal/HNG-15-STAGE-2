import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/products/route';

describe('Products API Route', () => {
  it('returns active Abeokuta dried catfish products and cookbook', async () => {
    const req = new Request('http://localhost:3000/api/products');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThan(0);

    const titles = data.products.map((p: any) => p.title.toLowerCase());
    const hasCatfish = titles.some((t: string) => t.includes('catfish'));
    const hasCookbook = titles.some((t: string) => t.includes('cookbook'));

    expect(hasCatfish).toBe(true);
    expect(hasCookbook).toBe(true);
  });
});

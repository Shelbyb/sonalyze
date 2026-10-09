import { describe, it, expect } from 'vitest';
import { GET as apiHealthGet, HEAD as apiHealthHead } from '../app/api/health/route';
import { GET as healthzGet, HEAD as healthzHead } from '../app/healthz/route';

describe('Health check endpoints', () => {
  it('GET /api/health returns 200 with healthy status', async () => {
    const response = await apiHealthGet();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.timestamp).toBe('string');
  });

  it('HEAD /api/health returns 200 without body', async () => {
    const response = await apiHealthHead();
    expect(response.status).toBe(200);
  });

  it('GET /healthz returns 200 with healthy status', async () => {
    const response = await healthzGet();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  it('HEAD /healthz returns 200 without body', async () => {
    const response = await healthzHead();
    expect(response.status).toBe(200);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import authApi from '@/api/authApi';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('authApi', () => {
  it('me() returns user when session authenticated', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, user: { email: 'alice@example.com' } })
    });

    const user = await authApi.me();
    expect(user).toEqual({ email: 'alice@example.com' });
    expect(fetch).toHaveBeenCalledWith('/api/session', { method: 'GET', credentials: 'include' });
  });

  it('me() throws when not authenticated', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    await expect(authApi.me()).rejects.toThrow();
  });

  it('loginViaEmailPassword succeeds on OK', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'ok' })
    });

    const res = await authApi.loginViaEmailPassword('a@a.com', 'pw');
    expect(res).toEqual({ success: true, message: 'ok' });
  });

  it('loginViaEmailPassword throws with status and data on failure', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'invalid' })
    });

    await expect(authApi.loginViaEmailPassword('a@a.com', 'bad')).rejects.toMatchObject({ status: 401 });
  });

  it('register() returns json on success', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    const data = await authApi.register('bob@example.com', 'pw');
    expect(data).toEqual({ success: true });
  });

  it('generateTOTPSecret returns secret and qrCode', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ secret: 'x', qrCode: 'data' }) });
    const data = await authApi.generateTOTPSecret();
    expect(data).toEqual({ secret: 'x', qrCode: 'data' });
  });
});
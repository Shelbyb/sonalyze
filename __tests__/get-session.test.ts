import { describe, it, expect, vi } from 'vitest';
import { getAuthSession } from '@/lib/getSession';
import { getServerSession } from 'next-auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { name: 'Alex Johnson', email: 'alex@example.com' },
  }),
}));

describe('getSession helper', () => {
  it('calls getServerSession with authOptions', async () => {
    const session = await getAuthSession();
    expect(getServerSession).toHaveBeenCalled();
    expect(session?.user?.name).toBe('Alex Johnson');
  });
});

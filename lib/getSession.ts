import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireServiceAuth } from '@/lib/daywalker-auth';

export async function getAuthSession() {
  await requireServiceAuth();
  return getServerSession(authOptions);
}

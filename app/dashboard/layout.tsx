import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/getSession';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session) {
    redirect('/');
  }

  const user = session!.user;

  return (
    <div className="min-h-screen bg-base">
      <Sidebar userName={user?.name} userImage={user?.image} />
      <MobileNav />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

import { SiteLayout } from '@/components/site-layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}

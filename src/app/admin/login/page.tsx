import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }
  return <AdminLoginForm />;
}

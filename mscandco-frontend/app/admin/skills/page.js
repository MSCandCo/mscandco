import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { userHasPermission } from '@/lib/permissions';
import SkillsAdminClient from './SkillsAdminClient';

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Skills & Learning Management',
  description: 'Manage learning resources, skills tracking, and educational content'
}

export default async function SkillsAdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has permission to manage learning/skills
  const hasPermission = await userHasPermission(
    session.user.id,
    'learning:manage',
    true // use service role
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return <SkillsAdminClient user={session.user} />;
}

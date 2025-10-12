import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res });

  const { data: { session }, error } = await supabase.auth.getSession();

  res.status(200).json({
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    error: error?.message,
    cookies: req.cookies,
    headers: Object.keys(req.headers)
  });
}

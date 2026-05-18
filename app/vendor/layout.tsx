import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // If the token is invalid/expired, it throws. Just ignore and let it redirect below.
    console.warn("Auth check failed:", error);
  }

  /*
  if (!user) {
    redirect('/vendor-login');
  }

  // Double check vendor record on server side
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    redirect('/vendor-login?error=unauthorized');
  }
  */

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main>{children}</main>
    </div>
  );
}

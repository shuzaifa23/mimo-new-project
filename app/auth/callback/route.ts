import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/student';

  // Pre-calculate redirect target
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectUrl = `${origin}${next}`;
  
  if (!isLocalEnv && forwardedHost) {
    redirectUrl = `https://${forwardedHost}${next}`;
  }
  
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          async setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              // Set on the next/headers cookie store
              await cookieStore.set(name, value, options);
              // ALSO set directly on the redirect response headers
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    } else {
      console.error('OAuth exchange error:', error);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/student/login?error=auth-failed`);
}

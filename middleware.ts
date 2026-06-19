import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://printmimo.page';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http');
    } catch {
      return false;
    }
  };

  if (
    !supabaseUrl || 
    !supabaseAnonKey || 
    supabaseUrl === 'undefined' || 
    supabaseAnonKey === 'undefined' || 
    supabaseUrl === 'null' || 
    supabaseAnonKey === 'null' ||
    !isValidUrl(supabaseUrl)
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  
  // Catch OAuth code redirects that fell back to the root Site URL
  // and forward them to the proper auth callback route handler.
  const code = request.nextUrl.searchParams.get('code')
  if (code && !path.startsWith('/auth/callback')) {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    callbackUrl.searchParams.set('next', '/')
    return NextResponse.redirect(callbackUrl)
  }

  // 1. Admin Protection (Handled by client-side guard)
  /*
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      return session ? NextResponse.redirect(new URL('/admin', request.url)) : response
    }
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  */

  // 2. Vendor Protection (Handled by client-side guard)
  /*
  if (path.startsWith('/vendor') && !path.startsWith('/vendor-login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/vendor-login', request.url))
    }
  }
  */

  // 3. Student Protection
  if (path === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/student/login', request.url))
    }
  }

  if (path.startsWith('/student')) {
    if (path === '/student/login') {
      if (session) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return response
    }
    if (!session) {
      return NextResponse.redirect(new URL('/student/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*', '/student/:path*', '/'],
}


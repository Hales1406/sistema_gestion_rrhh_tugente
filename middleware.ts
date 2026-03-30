
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
    const isChangePasswordPage = req.nextUrl.pathname === '/auth/change-password';

    // Si el usuario está autenticado y debe cambiar su contraseña
    if (isAuth && token?.mustChangePassword && !isChangePasswordPage) {
      return NextResponse.redirect(new URL('/auth/change-password', req.url));
    }

    // Si el usuario está en la página de cambio de contraseña pero no necesita cambiarla
    if (isAuth && isChangePasswordPage && !token?.mustChangePassword) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (isAuthPage) {
      if (isAuth && !isChangePasswordPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    if (isAdminPage && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/personal/:path*',
  ]
};

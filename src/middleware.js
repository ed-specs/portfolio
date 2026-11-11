import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// declared routes
const protectedRoutes = [
  "/admin/dashboard",
  "/admin/about-me",
  "/admin/projects",
  "/admin/experience",
  "/admin/tech-stacks",
  "/admin/profile",
  "/admin/change-password",
];
const authRoutes = ["/admin", "/forgot-password"];

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Authenticate token with Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuth = authRoutes.some((route) =>
    route === "/admin" ? pathname === "/admin" : pathname.startsWith(route),
  );

  // Case 1: Unauthenticated user visits protected page -> redirect to login
  if (isProtected && !user) {
    url.pathname = "/";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Case 2: Logged-in user visits auth pages -> redirect to dashboard
  if (isAuth && user) {
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

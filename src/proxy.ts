import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, role, configured } = await updateSession(request);

  if (!configured) {
    // Pas de projet Supabase configuré : mode démo, pas d'auth appliquée.
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;
  const dashboardFor = (r: "coach" | "client") => (r === "coach" ? "/admin/dashboard" : "/client/dashboard");

  if (pathname === "/login") {
    if (user && role) {
      return NextResponse.redirect(new URL(dashboardFor(role), request.url));
    }
    return supabaseResponse;
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isClientPath = pathname.startsWith("/client");

  if (pathname === "/" && user && role) {
    return NextResponse.redirect(new URL(dashboardFor(role), request.url));
  }

  if ((isAdminPath || isClientPath) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminPath && role !== "coach") {
    return NextResponse.redirect(new URL(role === "client" ? dashboardFor("client") : "/login", request.url));
  }

  if (isClientPath && role !== "client") {
    return NextResponse.redirect(new URL(role === "coach" ? dashboardFor("coach") : "/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export { auth as proxy } from "@/server/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/board/:path*",
    "/settings/:path*",
    "/locations-bin/:path*",
  ],
};

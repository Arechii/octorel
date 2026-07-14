import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

export const GET = (request: NextRequest) => {
  const state = crypto.randomUUID();

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("state", state);
  // Send the user back to the origin they started from. Without an explicit
  // redirect_uri GitHub falls back to the FIRST callback URL registered on
  // the GitHub App, which breaks apps with several registered callbacks.
  url.searchParams.set(
    "redirect_uri",
    new URL("/api/callback", request.nextUrl).toString(),
  );

  const response = NextResponse.redirect(url);
  response.cookies.set("gh-oauth-state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
};

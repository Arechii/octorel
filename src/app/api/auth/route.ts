import { NextResponse } from "next/server";
import { env } from "~/env";

export const GET = () => {
  const state = crypto.randomUUID();

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("state", state);

  // redirect_uri is omitted on purpose: GitHub falls back to the callback URL
  // registered on the GitHub App, so the same code works on every deployment.
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

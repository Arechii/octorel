import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { appOrigin } from "~/lib/app-origin";

export const GET = (request: NextRequest) => {
  const state = crypto.randomUUID();
  const redirectUri = `${appOrigin(request)}/api/callback`;

  // Logged so misconfigured deployments can see exactly which URL must be
  // registered as a callback URL on the GitHub App.
  console.log(`Starting GitHub sign-in with redirect_uri: ${redirectUri}`);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", redirectUri);

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

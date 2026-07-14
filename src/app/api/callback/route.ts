import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

export const GET = async (request: NextRequest) => {
  const fail = (reason: "state" | "exchange") => {
    const response = NextResponse.redirect(
      new URL(`/?error=${reason}`, request.nextUrl),
    );
    response.cookies.delete("gh-oauth-state");
    return response;
  };

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("gh-oauth-state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("state");
  }

  let token: string | undefined;

  try {
    const exchange = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    if (exchange.ok) {
      const data = (await exchange.json()) as { access_token?: string };
      token = data.access_token;
    }
  } catch {
    // fall through to the failure redirect
  }

  if (!token) {
    return fail("exchange");
  }

  const response = NextResponse.redirect(new URL("/", request.nextUrl));
  response.cookies.delete("gh-oauth-state");
  response.cookies.set("gh-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
};

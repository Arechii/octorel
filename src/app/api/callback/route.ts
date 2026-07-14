import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { appOrigin } from "~/lib/app-origin";

export const GET = async (request: NextRequest) => {
  const origin = appOrigin(request);

  const fail = (reason: "state" | "exchange") => {
    const response = NextResponse.redirect(
      new URL(`/?error=${reason}`, origin),
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
          redirect_uri: `${origin}/api/callback`,
        }),
      },
    );

    if (exchange.ok) {
      // GitHub responds 200 even on failure, with error details in the body
      // (e.g. incorrect_client_credentials, bad_verification_code).
      const data = (await exchange.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };
      token = data.access_token;

      if (!token) {
        console.error(
          `GitHub token exchange failed: ${data.error ?? "unknown error"} - ${data.error_description ?? "no description"}`,
        );
      }
    } else {
      console.error(
        `GitHub token exchange failed with HTTP ${exchange.status}: ${await exchange.text()}`,
      );
    }
  } catch (error) {
    console.error("GitHub token exchange request failed:", error);
  }

  if (!token) {
    return fail("exchange");
  }

  const response = NextResponse.redirect(new URL("/", origin));
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

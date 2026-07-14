"use server";

import { cookies } from "next/headers";
import { Octokit } from "octokit";

export const setToken = async (token: string): Promise<string | null> => {
  const octokit = new Octokit({ auth: token });

  try {
    await octokit.rest.users.getAuthenticated();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 401
    ) {
      return "GitHub rejected that token, check it and try again.";
    }

    return "Couldn't reach GitHub to verify the token, try again in a moment.";
  }

  const cookieStore = await cookies();
  cookieStore.set("gh-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return null;
};

export const clearToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("gh-token");
};

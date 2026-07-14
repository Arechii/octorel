"use server";

import { cookies } from "next/headers";

export const clearToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("gh-token");
};

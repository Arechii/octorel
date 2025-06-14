import { cookies } from "next/headers";
import { Suspense } from "react";
import { Releases } from "~/components/releases";
import { SetToken } from "~/components/set-token";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has("gh-token");

  const setToken = async (token: string) => {
    "use server";

    const cookieStore = await cookies();
    cookieStore.set("gh-token", token, { secure: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col gap-4">
          {!hasToken && <SetToken apply={setToken} />}
          {hasToken && (
            <Suspense fallback="Loading...">
              <Releases token={cookieStore.get("gh-token")!.value} />
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
}

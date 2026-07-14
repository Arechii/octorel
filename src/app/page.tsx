import { cookies } from "next/headers";
import { Suspense } from "react";
import { Releases } from "~/components/releases";
import { SetToken } from "~/components/set-token";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh-token")?.value;

  const setToken = async (token: string) => {
    "use server";

    const cookieStore = await cookies();
    cookieStore.set("gh-token", token, { secure: true });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 p-2">
        <div className="flex flex-col gap-4">
          {token ? (
            <Suspense fallback="Loading...">
              <Releases token={token} />
            </Suspense>
          ) : (
            <SetToken apply={setToken} />
          )}
        </div>
      </div>
    </main>
  );
}

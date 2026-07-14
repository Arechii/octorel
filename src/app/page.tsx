import { Loader2, LogOut } from "lucide-react";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Releases } from "~/components/releases";
import { SetToken } from "~/components/set-token";
import { Button } from "~/components/ui/button";
import { clearToken, setToken } from "./actions";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh-token")?.value;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {token && (
        <form action={clearToken} className="fixed top-2 right-12 z-10">
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            aria-label="Sign out"
          >
            <LogOut />
          </Button>
        </form>
      )}
      <div className="container flex flex-col items-center justify-center gap-12 p-2">
        <div className="flex flex-col gap-4">
          {token ? (
            <Suspense
              fallback={
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Fetching releases, this can take a while...
                </div>
              }
            >
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

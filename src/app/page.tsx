import { Loader2 } from "lucide-react";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Releases } from "~/components/releases";
import { SignIn } from "~/components/sign-in";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh-token")?.value;
  const { error } = await searchParams;

  if (!token) {
    return (
      <main className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center p-4">
        <SignIn error={error} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Fetching releases, this can take a while...
          </div>
        }
      >
        <Releases token={token} />
      </Suspense>
    </main>
  );
}

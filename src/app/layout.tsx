import "~/styles/globals.css";

import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { clearToken } from "./actions";

export const metadata: Metadata = {
  title: "OctoRel",
  description: "See latest starred GitHub repository releases",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const themeInitScript = `(function () {
  try {
    var theme = localStorage.getItem("theme");
    var dark = theme
      ? theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has("gh-token");

  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        {/* Applies the stored/system theme before first paint to avoid a flash */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
            <Link href="/" className="font-bold text-lg">
              OctoRel
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {hasToken && (
                <form action={clearToken}>
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
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeToggle } from "~/components/theme-toggle";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        {/* Applies the stored/system theme before first paint to avoid a flash */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <div className="fixed top-2 right-2 z-10">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}

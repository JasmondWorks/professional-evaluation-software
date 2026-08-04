import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "./components/useAuth";
import { Toaster } from "sonner";
import Logger from "./components/Logger";

// One workhorse UI face for the whole product, self-hosted via next/font and
// exposed as --font-sans (see tailwind fontFamily.sans). This replaces the
// previously commented-out Lato and the admin-only font, so marketing, auth,
// and app now share one typographic voice.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PES",
  description: "Performance Appraisal Software",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-canvas text-body flex flex-row relative justify-center max-w-[100vw] min-h-screen antialiased">
        {/* impeccable:direction-contract seed=canon:c2236011
            THESIS: A refined institutional dashboard for HR/performance evaluation,
              the category standard played straight — no metaphor, no irony. It refuses
              the split-personality of modern pages inside dated chrome.
            OWN-WORLD: Light canvas (#f7f7fa) with white surfaces, systematized indigo
              (#322b80 ramp) as the single brand ink, cool-neutral text ramp, hairline
              lines, one soft offset-shadow depth scale, Inter. Craft bar: Linear.
            STORY: A staff member or admin lands, instantly knows where they are (titled
              pages, active nav), completes a form or reads a result with calm confidence.
            FIRST VIEWPORT: Fixed left rail (brand header, grouped nav, user footer) + top
              bar (search, notifications, avatar); content in a max-width column with a
              clear page header. Primary action is the indigo button.
            FORM: canon (standing exit), chosen by user over assigned #7 and the night-flight
              challenger; seed key c2236011.
            FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */}
        <AuthProvider>
          <Logger />
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: "inherit" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

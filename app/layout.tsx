import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/src/Context/AuthProvider";
import AutoCapitalizeProvider from "@/src/components/AutoCapitalizeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Prescription document pairing — a serif for the letterhead/headings and a
// highly legible sans for body copy, so the printed prescription reads as a
// clinical document rather than a web page. Exposed as CSS variables and
// wired to the `font-rx-serif` / `font-rx-sans` utilities in globals.css, so
// they apply only to the prescription and leave the rest of the app on Geist.
// preload:false because these two are only ever painted by the prescription
// document (the print page plus the preview/history modals), not by ordinary
// app screens. Declaring them here keeps the CSS variables available app-wide
// — the modals need them — but preloading on every route would push woff2
// files the page never uses, which the browser warns about. display:"swap"
// means they still fetch on demand the moment a prescription renders.
const merriweather = Merriweather({
  variable: "--font-rx-serif-src",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-rx-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Dr. G. SubaJothiKumar — MBBS., MS(ENT)",
  description:
    "Clinic management system for Dr. G. SubaJothiKumar, ENT Specialist — consultations, prescriptions and patient records.",
  // Tab/app icon comes from the app/icon.png file convention, which
  // replaced the stock create-next-app app/favicon.ico. No `icons` entry
  // needed here — declaring both made the browser prefer the .ico.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AutoCapitalizeProvider />
        <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}

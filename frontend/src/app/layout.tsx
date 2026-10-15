import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
import GlobalRouteGuard from "@/components/auth/GlobalRouteGuard";

export const metadata: Metadata = {
  title: "TestApp",
  description: "Test Descritption ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers><GlobalRouteGuard>{children}</GlobalRouteGuard></Providers>
      </body>
    </html>
  );
}

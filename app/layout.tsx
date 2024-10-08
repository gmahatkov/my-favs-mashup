import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {Providers} from "@/app/providers";
import "./globals.css";
import AppNavbar from "@/components/AppNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Fav Mashups",
  description: "My Fav Mashups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={inter.className}>
      <Providers>
        <main className={'min-h-screen dark text-foreground bg-background'}>
          <AppNavbar/>
          {children}
        </main>
      </Providers>
    </body>
</html>
)
  ;
}

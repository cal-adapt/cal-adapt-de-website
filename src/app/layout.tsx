import { Metadata } from "next";
import { Inter } from "next/font/google";

import ThemeRegistry from "@/components/global/theme-registry/ThemeRegistry";
import Navigation from "@/components/home/Navigation";
import { LeftDrawerProvider } from "@/context/LeftDrawerContext";

import "@/styles/globals.scss";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cal-Adapt",
  description: "Climate Tools and Data",
};
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <LeftDrawerProvider>
          <ThemeRegistry options={{ key: "mui-theme" }}>{children}</ThemeRegistry>
        </LeftDrawerProvider>
      </body>
    </html>
  );
}

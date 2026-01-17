import { Metadata } from "next";
import { Inter } from "next/font/google";

import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import Navigation from "@/components/common/layout/Navigation";
import ThemeRegistry from "@/components/common/theme/ThemeRegistry";
import WebVitals from "@/components/common/WebVitals";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/config/constants";
import { LeftDrawerProvider } from "@/context/LeftDrawerContext";

import "@/styles/global.scss";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
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
      <GoogleAnalytics />
      <WebVitals />
    </html>
  );
}

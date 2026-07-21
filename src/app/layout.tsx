import { Metadata } from "next";

import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import ThemeRegistry from "@/components/common/theme/ThemeRegistry";
import Button from "@/components/common/ui/Button";
import WebVitals from "@/components/common/WebVitals";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/config/constants";
import { LeftDrawerProvider } from "@/context/LeftDrawerContext";

import "@/styles/global.scss";

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
      <body>
        <Button variant="skip" href="#main-content">
          Skip to main content
        </Button>
        <ThemeRegistry options={{ key: "mui-theme" }}>
          <LeftDrawerProvider>{children}</LeftDrawerProvider>
        </ThemeRegistry>
      </body>
      <GoogleAnalytics />
      <WebVitals />
    </html>
  );
}

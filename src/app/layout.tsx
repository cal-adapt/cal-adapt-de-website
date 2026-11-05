import { Metadata } from "next";

import GoogleAnalytics from "@/components/common/analytics/GoogleAnalytics";
import WebVitals from "@/components/common/analytics/WebVitals";
import SiteBanner from "@/components/common/layout/SiteBanner";
import ThemeRegistry from "@/components/common/theme/ThemeRegistry";
import Button from "@/components/common/ui/Button";
import Link from "@/components/common/ui/Link";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/config/constants";
import { featureFlags } from "@/config/feature-flags";
import { navLinks } from "@/config/navigation";
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
  const showBanner = featureFlags.__FF_SITE_BANNER__;

  return (
    <html lang="en" data-banner={showBanner ? "true" : undefined}>
      <body>
        <Button variant="skip" href="#main-content">
          Skip to main content
        </Button>
        {showBanner && (
          <SiteBanner>
            Just launched: See how extreme heat days could change where you live.{" "}
            <Link href={navLinks.extremeHeatDays.href}>Explore now →</Link>
          </SiteBanner>
        )}
        <ThemeRegistry options={{ key: "mui-theme" }}>
          <LeftDrawerProvider>{children}</LeftDrawerProvider>
        </ThemeRegistry>
      </body>
      <GoogleAnalytics />
      <WebVitals />
    </html>
  );
}

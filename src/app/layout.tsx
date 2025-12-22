import dynamic from "next/dynamic";

import "@/styles/globals.scss";
import { Inter } from "next/font/google";

import { LeftDrawerProvider } from "@/context/LeftDrawerContext";

const ThemeRegistry = dynamic(() => import("@/components/global/theme-registry/ThemeRegistry"), {
  ssr: false,
});
const Navigation = dynamic(() => import("@/components/home/Navigation"), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
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

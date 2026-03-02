import type { Metadata } from "next";

import RenewablesViz from "@/components/renewables-visualizer/RenewablesVisualizer";
import { SITE_TITLE } from "@/config/constants";
import { InstallationParamsProvider } from "@/context/InstallationParamsContext";
import { PhotoConfigProvider } from "@/context/PhotoConfigContext";
import { ResProvider } from "@/context/ResContext";
import { navLinks } from "@/data/navigation";

export const metadata: Metadata = {
  title: `${navLinks.renewablesVisualizer.label} - ${SITE_TITLE}`,
};

export default async function RenewablesVizPage() {
  return (
    <PhotoConfigProvider>
      <InstallationParamsProvider>
        <ResProvider>
          <RenewablesViz></RenewablesViz>
        </ResProvider>
      </InstallationParamsProvider>
    </PhotoConfigProvider>
  );
}

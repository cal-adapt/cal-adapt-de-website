import RenewablesViz from "@/components/renewables-visualizer/RenewablesVisualizer";
import { ApiResponse } from "@/components/renewables-visualizer/types";
import { PhotoConfigProvider } from "@/context/PhotoConfigContext";
import { InstallationPrmsProvider } from "@/context/InstallationParamsContext";
import { ResProvider } from "@/context/ResContext";

export default async function RenewablesVizWrapper() {
  return (
    <PhotoConfigProvider>
      <InstallationPrmsProvider>
        <ResProvider>
          <RenewablesViz></RenewablesViz>
        </ResProvider>
      </InstallationPrmsProvider>
    </PhotoConfigProvider>
  );
}

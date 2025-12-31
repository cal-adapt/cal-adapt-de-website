import RenewablesViz from "@/components/renewables-visualizer/RenewablesVisualizer";
import { InstallationPrmsProvider } from "@/context/InstallationParamsContext";
import { PhotoConfigProvider } from "@/context/PhotoConfigContext";
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

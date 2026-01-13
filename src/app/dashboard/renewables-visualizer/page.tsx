import RenewablesViz from "@/components/renewables-visualizer/RenewablesVisualizer";
import { InstallationParamsProvider } from "@/context/InstallationParamsContext";
import { PhotoConfigProvider } from "@/context/PhotoConfigContext";
import { ResProvider } from "@/context/ResContext";

export default async function RenewablesVizWrapper() {
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

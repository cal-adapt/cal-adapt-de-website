import { InteractionData } from "./Heatmap";
import "@/styles/dashboard/heatmap.scss";

type TooltipProps = {
  interactionData: InteractionData | null;
  width: number;
  height: number;
};

export default function MapTooltip({
  interactionData,
  width,
  height,
}: TooltipProps) {
  if (!interactionData) {
    return null;
  }

  const renderTooltipRow = (label: string, value: string | number) => {
    return (
      <div>
        <b>{label}</b>
        <span>: </span>
        <span>{value}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        width,
        height,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <div
        className="map-tooltip"
        style={{
          position: "absolute",
          left: interactionData.xPos,
          top: interactionData.yPos,
        }}
      >
        {renderTooltipRow("Year", interactionData.xLabel)}
        {renderTooltipRow("Month", interactionData.yLabel)}
        {renderTooltipRow(
          "Selected resource drought days",
          interactionData.value,
        )}
      </div>
    </div>
  );
}

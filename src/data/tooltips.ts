export interface Tooltip {
  id: number;
  title: string;
  long_text: string;
  short_text: string;
}

export const tooltips: Tooltip[] = [
  {
    id: 0,
    title: "Global Warming Level",
    long_text:
      "A global warming level refers to the increase in global-mean temperature with respect to preindustrial conditions.",
    short_text:
      "A global warming level refers to the increase in global-mean temperature with respect to preindustrial conditions.",
  },
  {
    id: 1,
    title: "Metric",
    long_text:
      "A specific, quantifiable measure used to assess and understand different aspects of climate change.",
    short_text:
      "A specific, quantifiable measure used to assess and understand different aspects of climate change.",
  },
  {
    id: 2,
    title: "Resource",
    long_text: "The resource of interest. Either Solar / Wind",
    short_text: "The resource of interest. Either Solar / Wind",
  },
  {
    id: 3,
    title: "Projections Type",
    long_text:
      "Absolute shows the expected value at the selected warming level. Delta shows the change from the historical baseline (0.8°C).",
    short_text:
      "Absolute shows the expected value at the selected warming level. Delta shows the change from the historical baseline (0.8°C).",
  },
];

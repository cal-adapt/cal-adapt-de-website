import { Suspense } from "react";

import Callout from "@/components/common/content/Callout";
import Link from "@/components/common/ui/Link";
import ToolButton from "@/components/common/ui/ToolButton";
import { navLinks } from "@/config/navigation";

import HeatSummaryRadialPrototype from "./figures/HeatSummaryRadial.prototype";
import StoryToolFigure from "./figures/StoryToolFigure";
import {
  resolveStoryToolSelections,
  storyToolCharts,
  storyToolHref,
  storyToolLink,
} from "./figures/tool-charts";
import GlossaryTerm from "./GlossaryTerm";
import StoryBlock from "./StoryBlock";
import StoryCitation from "./StoryCitation";
import StoryDocument from "./StoryDocument";

const SANTA_BARBARA_99PCTL = resolveStoryToolSelections("extreme-heat-days", {
  location: "Santa Barbara",
  threshold: "99pctl",
});
const SACRAMENTO_HEAT_WAVE_LENGTH_100F = resolveStoryToolSelections("extreme-heat-days", {
  climateVariable: "heat-wave-length",
  threshold: "100F",
});
const SACRAMENTO_HEAT_WAVE_FREQUENCY_100F_5D = resolveStoryToolSelections("extreme-heat-days", {
  climateVariable: "heat-wave-frequency",
  location: "Sacramento",
  threshold: "100F",
  duration: "5",
});
const HEAT_SEASON_95F = resolveStoryToolSelections("extreme-heat-days", {
  climateVariable: "extreme-heat-season",
  threshold: "95F",
});
const GREATER_BAY_AREA_CDD = resolveStoryToolSelections("hdd-cdd", {
  climateVariable: "cdd",
  spatialAggregation: "forecast_zones",
  location: "Greater Bay Area",
});
const EXTREME_HEAT_DAYS_CHANGE_MAP = resolveStoryToolSelections("climate-metrics-map", {
  metric: "extreme-heat",
  valueType: "del",
  gwl: 3.0,
});
const WARM_NIGHTS_CHANGE_MAP = resolveStoryToolSelections("climate-metrics-map", {
  metric: "warm-nights",
  valueType: "del",
  gwl: 3.0,
});

const EXTREME_HEAT_DAYS_MAP = storyToolLink(
  "climate-metrics-map",
  resolveStoryToolSelections("climate-metrics-map", { metric: "extreme-heat" })
);

const SACRAMENTO_HEAT_WAVES_BLOG_POST = {
  label: "The 2020 Sacramento Heat Waves",
  href: "https://analytics.cal-adapt.org/blog/posts/2026-08-18-sac-extreme-heat/",
} as const;

const EXTREME_HEAT_TOOL = storyToolCharts["extreme-heat-days"].navLink;

export default function ExtremeHeatStory() {
  return (
    <StoryDocument>
      {/* PROTOTYPE: remove before merging to main. */}
      {process.env.NODE_ENV !== "production" ? (
        <Suspense fallback={null}>
          <HeatSummaryRadialPrototype />
        </Suspense>
      ) : null}
      <StoryBlock id="more-frequent-days" title="Extreme heat days will become more frequent">
        <p>
          As climate change warms the state, Californians will experience a sharp rise in{" "}
          <GlossaryTerm
            term="Extreme Heat Day"
            definition="A day in which the maximum temperature exceeds a defined threshold that poses a significant risk to human health, ecosystems, and infrastructure."
          >
            extreme heat days,
          </GlossaryTerm>{" "}
          multiplying the daily risks to our communities and critical infrastructure. Days where the
          temperature reaches 95°F or higher pose a danger to outdoor workers
          <StoryCitation citationKey="calOSHAheatillness2024" />, and days above 100°F are more
          likely to result in power outages from electrical equipment exposed to high temperatures
          combined with increased electricity demand from air conditioning
          <StoryCitation citationKey="sakiMultiyear2025" />. Climate models project that these
          extreme heat days will become more frequent across California, with cities in the Central
          Valley like Sacramento, Fresno, and Bakersfield experiencing an additional 30 days per
          year above 95°F by the end of the century compared to the early 2000s.
        </p>
        <StoryToolFigure tool="climate-metrics-map" selections={EXTREME_HEAT_DAYS_CHANGE_MAP} />
        <p>
          The coastal regions of California generally don’t experience temperatures as high as
          inland areas due to temperature moderation from the ocean, but even these areas will need
          to adapt to a new range of conditions under climate change. Temperatures that were
          previously only reached on the 3-4 hottest days of the year in coastal cities like Santa
          Barbara are projected to occur up to 10-12 times per year on average by the end of the
          century. These changes can have significant impacts in these coastal regions where
          buildings, infrastructure, and ecological communities have not adapted for frequent high
          temperatures.
        </p>
        <StoryToolFigure
          tool="extreme-heat-days"
          selections={SANTA_BARBARA_99PCTL}
          toolLinks={[EXTREME_HEAT_DAYS_MAP]}
        />
      </StoryBlock>

      <Callout
        kind="explore"
        title="Make these figures your own"
        actions={
          <>
            <ToolButton
              size="small"
              navLink={EXTREME_HEAT_TOOL}
              href={storyToolHref("extreme-heat-days", SANTA_BARBARA_99PCTL)}
            />
            <ToolButton size="small" navLink={navLinks.hddCdd} />
            <ToolButton size="small" navLink={navLinks.climateMetricsMap} />
          </>
        }
      >
        <p>
          Every figure on this page comes from a Cal-Adapt tool. Open a tool to see the same figure
          for another location or temperature threshold, download it, or read about the underlying
          data.
        </p>
      </Callout>

      <StoryBlock id="heat-waves" title="Heat waves will be more frequent and last longer">
        <p>
          The most severe impacts from extreme heat in California result from prolonged heat waves.
          Each day that a heat wave persists significantly compounds the risks to human health
          <StoryCitation citationKey="guirguisImpact2014" />{" "}
          <StoryCitation citationKey="andersonHeat2011" />, the increases in electricity demand
          <StoryCitation citationKey="millerClimate2008" /> to keep buildings cool, and the chances
          of wildfires
          <StoryCitation citationKey="vargaMegafires2022" />{" "}
          <StoryCitation citationKey="shivesMultiple2025" />. In Sacramento County where heat waves
          over 100°F already pose significant stress to the electrical grid and human health, the
          average length of these events is projected to increase by nearly two days by the end of
          the century.
        </p>
        <StoryToolFigure
          tool="extreme-heat-days"
          selections={SACRAMENTO_HEAT_WAVE_LENGTH_100F}
          relatedLinks={[SACRAMENTO_HEAT_WAVES_BLOG_POST]}
        />
        <p>
          These long, intense heat waves will also become more frequent. In Sacramento County, heat
          waves lasting at least five days with daily temperatures exceeding 100°F have historically
          occurred about three times a year on average. That number is projected to nearly double by
          mid-century and to exceed eight per year by the end of the century. Knowing how the
          likelihood of prolonged extreme heat waves will change in the coming decades helps
          planners and policymakers prioritize investments in a resilient electrical grid and public
          safety measures.
        </p>
        <StoryToolFigure
          tool="extreme-heat-days"
          selections={SACRAMENTO_HEAT_WAVE_FREQUENCY_100F_5D}
        />
      </StoryBlock>

      <StoryBlock id="warm-nights" title="Warm nights prevent the opportunity to cool off">
        <p>
          The impact of extreme heat is multiplied when it is coupled with warm nighttime
          temperatures that don’t allow people, animals, buildings, or critical electrical
          infrastructure to cool off overnight before another hot day. These warm night conditions
          can raise the mortality rate of heat waves
          <StoryCitation citationKey="guirguisImpact2014" />, reduce the productivity of crops that
          depend on nighttime chill hours
          <StoryCitation citationKey="romeroCapRadioAlmonds2018" />, increase the failure rate of
          electrical transformers
          <StoryCitation citationKey="kezunovicExtremeWeather2016" />, and change the dynamics of
          the electrical grid by driving electricity demand at hours that previously had very low
          demand
          <StoryCitation citationKey="wangRapid2023" />.
        </p>
        <StoryToolFigure tool="climate-metrics-map" selections={WARM_NIGHTS_CHANGE_MAP} />
        <p>
          Across the entire state of California, the number of days per year where the minimum
          temperature remains above 70°F is expected to increase on average by 13 days per year by
          mid-century, and 24 days per year by the end of the century. The increase in warm nights
          is particularly high in urban regions where the built infrastructure retains more heat
          overnight, and in the foothills surrounding the central valley, where warm air from the
          valley floor is pushed up into the hills and trapped overnight.
        </p>
        <p>
          For example, San Bernardino is expected to experience an additional 28 days per year above
          70°F by mid century and an additional 46 by the end of the century. Explore the map above
          to see the spatial variability in warm nights across the entire state.
        </p>
      </StoryBlock>

      <StoryBlock
        id="extreme-heat-season"
        title="The “extreme heat season” in California will start earlier and last longer"
      >
        <p>
          Extreme heat is more dangerous when it isn’t expected. Wildfire preparation, agricultural
          planning, and community cooling center operations all depend on understanding the timing
          and seasonality of extreme heat. Climate models show that as climate change progresses,
          extreme heat events will occur both earlier and later in the year, expanding the seasonal
          window for extreme heat. Extreme heat events that occur early in the year before humans,
          animals, and plants have acclimated to the heat can be much more dangerous
          <StoryCitation citationKey="guirguisImpact2014" />. Extreme heat progressing later into
          the fall can lengthen the wildfire season and exacerbate the effects of Santa Ana wind
          events on fire risk
          <StoryCitation citationKey="gershunovHot2021" />. Understanding this extended “extreme
          heat season” is crucial for adaptation planning across the state.
        </p>
        <p>
          In Sacramento County, the part of the year where temperatures are likely (more than a 50%
          chance) to top 95°F historically ran from late June to the start of September. At 2.0°C of
          global warming, that season starts about two weeks earlier and ends about three weeks
          later, running from mid-June to late September.
        </p>
        <StoryToolFigure tool="extreme-heat-days" selections={HEAT_SEASON_95F} />
      </StoryBlock>

      <StoryBlock id="electricity-demand" title="Extreme heat drives higher electricity demand">
        <p>
          Whenever temperatures rise across the state, so does electricity demand from keeping
          buildings cool. Planning a resilient electrical system requires anticipating how much the
          climate will be driving increased demand, and where that demand will be the highest.
        </p>
        <p>
          Cooling Degree Days (CDD) are a metric used by the energy sector to estimate how hot
          temperatures will translate into demand for electricity to keep buildings cool. Using a
          comfort threshold of 65°F, CDDs measure how far the temperature exceeds that threshold and
          how often those exceedances happen throughout the year. Although it does not account for
          all the factors that drive electricity demand for cooling, CDDs are an essential metric
          for forecasting electricity demand across the state.
        </p>
        <p>
          Across the entire state the projected median increase in annual CDDs is 37% by
          mid-century. The most impactful increases in temperature driven demand can come from parts
          of the state with more moderate temperatures that will likely start experiencing more days
          above 65°F. For example, in the Greater Bay Area Electricity Forecast Zone, CDDs are
          projected to nearly double by mid-century and triple by the end of the century.
        </p>
        <StoryToolFigure tool="hdd-cdd" selections={GREATER_BAY_AREA_CDD} />
      </StoryBlock>

      <StoryBlock id="robust-planning" title="Using Cal-Adapt for robust climate planning">
        <p>
          The examples on this page illustrate that it takes more than one chart or metric to tell
          the full story of extreme heat impacts. Considering extreme heat through multiple
          perspectives of timescales, thresholds, and seasons is key to understanding the full
          picture of how a region, community, or industry will be impacted by climate change. For
          planners examining electricity demand, changes in Cooling Degree Days (CDD) provide a
          convenient annual summary of increasing demand, while Warm Nights and Extreme Heat Season
          metrics can help plan for additional demand during off-peak hours and times of the year.
        </p>
        <p>
          Cal-Adapt is built to enable users to understand the climate impacts to their own
          community. As this statewide overview demonstrates, each region of California will
          experience extreme heat differently. For example, while coastal regions will not face the
          same threat from record high temperatures as inland California, they must plan for
          persistent heat waves occurring earlier in the year. Use the detailed tools across
          Cal-Adapt to see how extreme heat is projected to change in your own community.
        </p>
        <Callout kind="note" variant="blue" title="Go further with the Cal-Adapt: Analytics Engine">
          <p>
            For users that require even more depth and customization, such as implementing custom
            metrics or using statistical techniques to examine extreme events, the Cal-Adapt:
            Analytics Engine provides a Python package and a notebook interface for advanced climate
            data analysis. See our page on{" "}
            <Link href="https://analytics.cal-adapt.org/data-tools/python-tools.html">
              Cal-Adapt Python tools
            </Link>{" "}
            for more information.
          </p>
        </Callout>
      </StoryBlock>
    </StoryDocument>
  );
}

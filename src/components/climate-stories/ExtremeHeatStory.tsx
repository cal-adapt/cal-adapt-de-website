import type { ClimateStory } from "@/config/climate-stories";
import { navLinks } from "@/config/navigation";

import GlossaryTerm from "./GlossaryTerm";
import { relatedToolLink } from "./related-tool";
import StoryBlock from "./StoryBlock";
import StoryCitation from "./StoryCitation";
import StoryDocument from "./StoryDocument";
import StoryFigure from "./StoryFigure";
import type { StorySection } from "./StoryTableOfContents";
import StoryToolCallout from "./StoryToolCallout";

const FPO_FIGURE = { label: "[FPO: Figure]", source: "Lorem ipsum" } as const;

const MORE_FREQUENT_DAYS = {
  id: "more-frequent-days",
  title: "Extreme heat days will become more frequent",
} as const;

const BREAKING_RECORDS = {
  id: "breaking-records",
  title: "Climate change is breaking records across California",
} as const;

const HEAT_WAVES = {
  id: "heat-waves",
  title: "Heat waves will be more frequent and last longer",
} as const;

const WARM_NIGHTS = {
  id: "warm-nights",
  title: "Warm nights prevent the opportunity to cool off",
} as const;

const HEAT_SEASON = {
  id: "extreme-heat-season",
  title: "The “extreme heat season” in California will start earlier and last longer",
} as const;

const ELECTRICITY_DEMAND = {
  id: "electricity-demand",
  title: "Extreme heat drives higher electricity demand",
} as const;

const ROBUST_PLANNING = {
  id: "robust-planning",
  title: "Using Cal-Adapt for robust climate planning",
} as const;

export const extremeHeatSections = [
  MORE_FREQUENT_DAYS,
  BREAKING_RECORDS,
  HEAT_WAVES,
  WARM_NIGHTS,
  HEAT_SEASON,
  ELECTRICITY_DEMAND,
  ROBUST_PLANNING,
] as const satisfies readonly StorySection[];

interface ExtremeHeatStoryProps {
  story: ClimateStory;
}

export default function ExtremeHeatStory({ story }: ExtremeHeatStoryProps) {
  const relatedTool = relatedToolLink(story.relatedToolId);

  return (
    <StoryDocument>
      <StoryBlock id={MORE_FREQUENT_DAYS.id} title={MORE_FREQUENT_DAYS.title}>
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
          <StoryCitation citationKey="khatanaAssociation2022" />, and days above 100°F are more
          likely to result in power outages from electrical equipment exposed to high temperatures
          combined with increased electricity demand from air conditioning
          <StoryCitation citationKey="eia-ca-consumers-heatwave-2022" />. The frequency of these
          extreme heat days is projected to increase across California, with the hottest parts of
          the state experiencing more than [60?] days per year above 95°F by the end of the century
          compared to [days] in the 2000s.
        </p>
        <p>
          The coastal regions of California generally don’t experience temperatures as high as
          inland areas due to temperature moderation from the ocean, but even these areas will need
          to adapt to a new range of conditions under climate change. Temperatures that were
          previously only reached on the 3-4 hottest days of the year are projected to occur up to
          [X] times per year on average. Buildings, infrastructure, and ecological communities
          residing within these coastal regions were not designed and have not adapted for frequent
          high temperatures.
        </p>
        <StoryFigure {...FPO_FIGURE} />
      </StoryBlock>

      <StoryToolCallout
        title={`Explore this in the ${relatedTool.label} tool`}
        body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac eros felis. Duis id commodo dolor. Vestibulum ex velit, egestas ut quam eget, placerat hendrerit orci. Suspendisse ut elit leo. Nunc vel sem id est accumsan imperdiet sit amet a nulla."
        primary={{
          href: relatedTool.href,
          label: `Explore the ${relatedTool.label} tool`,
        }}
        secondary={{
          href: navLinks.climateMetricsMap.href,
          label: "Open the Climate Metrics Map",
        }}
      />

      <StoryBlock id={BREAKING_RECORDS.id} title={BREAKING_RECORDS.title}>
        <p>
          In the past 10 years, [some fraction] of California has experienced record high
          temperatures. Climate projections show that by mid-century, most of those records will be
          broken again, with record high temperatures increasing by [x-y] F across the state. These
          record breaking temperatures pose significant public health risks and stress the limits of
          the electrical grid. Understanding how temperatures will continue to reach unprecedented
          levels and strain the limits of what communities have prepared for is essential for
          planning resilient infrastructure and social services to protect Californians.
        </p>
        <p>
          The highest temperatures in the state are reached in California’s southwestern desert
          valleys, but every region of the state is expected to break its own record hottest
          temperature by mid-century. The largest increases in record temperature are projected to
          occur in the Sierra Nevadas and coastal regions of California. The most important impacts
          of high temperatures have less to do with the absolute number, and more to do with how far
          extremes surpass what humans are accustomed to and what infrastructure is designed to
          withstand.
        </p>
        <StoryFigure {...FPO_FIGURE} />
      </StoryBlock>

      <StoryBlock id={HEAT_WAVES.id} title={HEAT_WAVES.title}>
        <p>
          The most severe impacts from extreme heat in California result from prolonged heatwaves.
          Each day that a heat wave persists significantly compounds the risks to human health, the
          increases in electricity demand to keep buildings cool, and the chances of wildfires. As
          climate change drives warmer temperatures across the state, the frequency of moderate
          length heatwaves (2-3 days) is projected to increase by [Y], and the length of heatwaves
          is projected to increase by [X] on average. In [sample location], projections show that by
          mid-century a record breaking [n-day] heatwave is possible.
        </p>
        <StoryFigure {...FPO_FIGURE} />
      </StoryBlock>

      <StoryBlock id={WARM_NIGHTS.id} title={WARM_NIGHTS.title}>
        <p>
          The impact of extreme heat is multiplied when it is coupled with warm nighttime
          temperatures that don’t allow people, plants, animals, or buildings to cool off overnight
          before another hot day. These warm night conditions can increase the mortality rate of
          heatwaves, reduce the productivity of crops that depend on nighttime chill hours, and
          change the dynamics of the electrical grid by driving electricity demand at hours that
          previously had very low demand.
        </p>
        <p>
          Across California, the number of days per year where the minimum temperature does not drop
          below 70°F is expected to increase by [X] on average. The increase in warm nights is
          particularly high in the foothills surrounding the central valley, where warm air from the
          valley floor is pushed up into the hills and trapped overnight.
        </p>
        <StoryFigure {...FPO_FIGURE} />
      </StoryBlock>

      <StoryBlock id={HEAT_SEASON.id} title={HEAT_SEASON.title}>
        <p>
          Extreme heat is more dangerous when it isn’t expected. Preparing for wildfire risks,
          planning the agricultural growing season, and operating community cooling centers are all
          based on an expectation of when extreme heat is expected throughout the year. Climate
          models show that as climate change progresses, extreme heat events will occur both earlier
          and later in the year than ever before, expanding the seasonal window for extreme heat.
          Extreme heat events that occur early in the year before humans, animals, and plants have
          acclimated to the heat can be much more dangerous. Extreme heat progressing later into the
          fall can lengthen the wildfire season and exacerbate the effects of Santa Ana wind events
          on fire risk. Understanding this extended “extreme heat season” is crucial for adaptation
          planning across the state.
        </p>
        <p>
          In [example location], temperatures above 105°F may be expected as early as [ ] (x days
          earlier than the historical average) and as late as [ ] (y days later than the historical
          average).
        </p>
        <StoryFigure {...FPO_FIGURE} />
        <StoryFigure {...FPO_FIGURE} />
      </StoryBlock>

      <StoryBlock id={ELECTRICITY_DEMAND.id} title={ELECTRICITY_DEMAND.title}>
        <p>
          Whenever temperatures rise across the state, so does electricity demand from keeping
          buildings cool. Planning a resilient electrical system for the state requires anticipating
          how much the climate will be driving increased demand, and where in the state that demand
          will be the highest.
        </p>
        <p>
          Cooling Degree Days (CDD) is a yearly measure of how far above a comfortable temperature
          it is, and the amount of time spent above that temperature. This metric estimates the
          increased electricity usage to cool buildings, and is an important part of forecasting
          future electricity demand across the state.
        </p>
        <p>
          Across the state, CDDs are projected to increase by [ ], but the increased demand is
          strongly driven by the hottest parts of the state. In [sample forecast region], CDDs are
          projected to increase by [Y] by mid century, and by [Z] by the end of the century.
        </p>
        <StoryFigure {...FPO_FIGURE} />
      </StoryBlock>

      <StoryBlock id={ROBUST_PLANNING.id} title={ROBUST_PLANNING.title}>
        <p>
          The examples on this page illustrate that it takes more than one chart or metric to tell
          the full story of extreme heat impacts. Considering extreme heat through multiple
          perspectives of timescales, thresholds, and seasons is key to understanding the full
          picture of how a region, community, or industry will be impacted by climate change. For
          planners examining electricity demand, changes in cooling degree days (CDD) provide a
          convenient annual summary of increasing demand, while warm nights and extreme heat season
          metrics can help plan for additional demand during off-peak hours and times of the year.
          To support robust climate planning, Cal-Adapt offers a range of extreme heat metrics
          within each [data interface].
        </p>
        <p>
          Cal-Adapt is built to enable users to understand the climate impacts to their own
          community. As this statewide overview demonstrates, each region of California will
          experience extreme heat differently. For example, while coastal regions will not face the
          same threat from record high temperatures as inland California, they must plan for
          persistent heatwaves occurring earlier in the year. Use the [detailed tools] across
          Cal-Adapt to see how extreme heat is projected to change in your own county, city, census
          tract, or watershed.
        </p>
        <p>
          For users that require even more depth and customization, such as implementing custom
          metrics or using statistical techniques to examine extreme events, the Cal-Adapt:
          Analytics Engine provides a Python package and a notebook interface for advanced climate
          data analysis.
        </p>
      </StoryBlock>
    </StoryDocument>
  );
}

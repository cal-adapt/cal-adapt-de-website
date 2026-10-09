import { featureFlags } from "@/config/feature-flags";
import { type NavLink, navLinks } from "@/config/navigation";
import { resolveSelections } from "@/lib/hdd-cdd/options";
import { selectionsToSearchParams } from "@/lib/hdd-cdd/search-params";

/**
 * A "See also" link to a tool or reference where the term is used. Pass a
 * `navLinks` entry for pages on this site, so the link is dropped while that
 * page's feature flag is off.
 */
export type GlossaryLink = Pick<NavLink, "label" | "href" | "featureFlag"> & { id?: string };

export interface GlossaryEntry {
  /** URL-safe slug, also used as the entry's anchor on the glossary page. */
  id: string;
  term: string;
  abbreviation?: string;
  definition: string;
  /** Tools or references to see also. Keep to two or three. */
  links?: readonly GlossaryLink[];
}

/** Like `isNavLinkEnabled`, for links that are not full nav entries. */
export function isGlossaryLinkEnabled(link: GlossaryLink): boolean {
  return link.featureFlag == null || featureFlags[link.featureFlag];
}

/** Link to the Heating & Cooling Degree Days tool, opened on the given variable. */
export function hddCddToolLink(climateVariable: "cdd" | "hdd"): GlossaryLink {
  const query = selectionsToSearchParams(resolveSelections({ climateVariable })).toString();

  return {
    ...navLinks.hddCdd,
    href: query ? `${navLinks.hddCdd.href}?${query}` : navLinks.hddCdd.href,
  };
}

/** Link to a guidance page on the Cal-Adapt: Analytics Engine website. */
function analyticsEngineLink(href: string): GlossaryLink {
  return { label: "Learn more on the Analytics Engine", href };
}

/** Link to a Cal-Adapt methods white paper (PDF). */
function whitePaperLink(href: string): GlossaryLink {
  return { label: "Cal-Adapt white paper", href };
}

const DEGREE_DAYS_GUIDANCE_LINK = analyticsEngineLink(
  "https://analytics.cal-adapt.org/scientific-guidance/heat-metrics.html#cooling-and-heating-degree-days"
);

const entries = [
  {
    id: "climakitae",
    term: "ClimaKitAE",
    definition:
      "An open-source Python library that contains functionality to work with cloud-optimized gridded climate data. It includes basic tools for creating data objects and visualizations, as well as more advanced tools that support various applications of climate data including analyzing extreme events, understanding regional responses at different global warming levels, and describing uncertainty across different simulations. ClimaKitAE stands for “climate toolkit Analytics Engine”.",
    links: [
      { label: "climakitae on GitHub", href: "https://github.com/cal-adapt/climakitae" },
      {
        label: "climakitae documentation",
        href: "https://cal-adapt.github.io/climakitae/dev/",
      },
    ],
  },
  {
    id: "cooling-degree-days",
    term: "Cooling degree days",
    abbreviation: "CDDs",
    definition:
      "Cooling degree days (CDDs) measure how much and for how long outdoor temperatures exceed a specific threshold, indicating the need for indoor cooling. For each day, CDDs are calculated as the number of degrees the day’s temperature is above the chosen base temperature; days that do not exceed the threshold are assigned zero. The threshold (commonly 65°F) represents the temperature above which cooling is typically required.",
    links: [hddCddToolLink("cdd"), DEGREE_DAYS_GUIDANCE_LINK],
  },
  {
    id: "extreme-meteorological-year",
    term: "Extreme meteorological year",
    abbreviation: "XMY",
    definition:
      "A one-year climate profile that provides the same set of weather variables as a Typical Meteorological Year (TMY), but intentionally preserves or characterizes extreme weather conditions rather than median ones. The Analytics Engine provides two standardized XMY approaches, a Shock XMY and a Persistence XMY, tailored to different planning use cases.",
    links: [
      whitePaperLink(
        "https://analytics.cal-adapt.org/assets/pdfs/Cal-Adapt-XMY-Methods-White-Paper.pdf"
      ),
      analyticsEngineLink(
        "https://analytics.cal-adapt.org/scientific-guidance/climate_profiles/extreme-met-year.html"
      ),
    ],
  },
  {
    id: "global-warming-level",
    term: "Global warming level",
    abbreviation: "GWL",
    definition:
      "A global warming level (GWL) is defined as the difference in the global mean air temperature from the historical period (defined by Cal-Adapt as the pre-industrial period 1850-1900). Global warming levels are frequently used in international policy discussions (for example, goals to constrain global warming to 1.5 or 2 degrees Celsius). The standard global warming levels are 1.5°C, 2°C, 3°C, and 4°C.",
    links: [
      whitePaperLink("https://analytics.cal-adapt.org/assets/pdfs/Cal-Adapt-GWL-White-Paper.pdf"),
      analyticsEngineLink(
        "https://analytics.cal-adapt.org/scientific-guidance/global-warming-levels.html"
      ),
    ],
  },
  {
    id: "heating-degree-days",
    term: "Heating degree days",
    abbreviation: "HDDs",
    definition:
      "Heating degree days (HDDs) quantify how much and for how long outdoor temperatures fall below a specific threshold, reflecting demand for indoor heating. The base temperature (commonly 65°F) approximates the point at which heating becomes necessary.",
    links: [hddCddToolLink("hdd"), DEGREE_DAYS_GUIDANCE_LINK],
  },
  {
    id: "resource-drought",
    term: "Resource drought",
    definition:
      "A period during which the generation potential of a renewable energy source falls well below what is typical for that time of year. A solar resource drought refers to reduced photovoltaic generation; causes can include cloudiness, wildfire smoke, and/or high temperatures. A wind resource drought refers to reduced wind power generation caused by still or calm conditions. Resource droughts are identified relative to a location’s reference production.",
    links: [navLinks.renewablesVisualizer],
  },
  {
    id: "standard-year",
    term: "Standard year",
    definition:
      "A standard year is one year of hourly data that represents a statistical percentile of meteorological conditions for a location over a set amount of time (30 years). For example, for each hour of the year, the 90th percentile is taken across the same hour of the year from each of the 30 years of data. A standard year can be generated for any climate variable (temperature, solar radiation, etc.), any desired percentile (median and extremes), and for any location of interest.",
    links: [
      analyticsEngineLink(
        "https://analytics.cal-adapt.org/scientific-guidance/climate_profiles/standard-year.html"
      ),
    ],
  },
  {
    id: "typical-meteorological-year",
    term: "Typical meteorological year",
    abbreviation: "TMY",
    definition:
      "A typical meteorological year (TMY) is a complete set of meteorological variables at a given location for every hour in a year. TMYs are used in some building and energy system modeling applications to describe typical annual weather conditions at a specific location.",
    links: [
      analyticsEngineLink(
        "https://analytics.cal-adapt.org/scientific-guidance/climate_profiles/typical-met-year.html"
      ),
    ],
  },
] as const satisfies readonly GlossaryEntry[];

/** All glossary entries, alphabetical by term, with only the links enabled in this environment. */
export const glossaryEntries: readonly GlossaryEntry[] = entries
  .map(
    (entry: GlossaryEntry): GlossaryEntry => ({
      ...entry,
      links: entry.links?.filter(isGlossaryLinkEnabled),
    })
  )
  .sort((a, b) => a.term.localeCompare(b.term));

/** Term with its abbreviation, e.g. "Cooling degree days (CDDs)". */
export function glossaryEntryLabel(entry: GlossaryEntry): string {
  return entry.abbreviation ? `${entry.term} (${entry.abbreviation})` : entry.term;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Entries matching every whitespace-separated word in `query` (case-insensitive
 * substring match against the term, abbreviation and definition text).
 */
export function filterGlossaryEntries(
  all: readonly GlossaryEntry[],
  query: string
): readonly GlossaryEntry[] {
  const words = normalize(query).split(" ").filter(Boolean);

  return all.filter((entry) => {
    const text = normalize(`${glossaryEntryLabel(entry)} ${entry.definition}`);
    return words.every((word) => text.includes(word));
  });
}

export interface GlossaryLetterGroup {
  letter: string;
  entries: readonly GlossaryEntry[];
}

/** Groups entries (already alphabetical) under the first letter of their term. */
export function groupGlossaryEntriesByLetter(
  all: readonly GlossaryEntry[]
): readonly GlossaryLetterGroup[] {
  const groups: { letter: string; entries: GlossaryEntry[] }[] = [];

  for (const entry of all) {
    const letter = entry.term.charAt(0).toUpperCase();
    const last = groups.at(-1);

    if (last?.letter === letter) {
      last.entries.push(entry);
    } else {
      groups.push({ letter, entries: [entry] });
    }
  }

  return groups;
}

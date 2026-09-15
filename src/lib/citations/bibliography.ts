import { readFile } from "node:fs/promises";
import path from "node:path";
import { Cite } from "rehype-citation";

const BIBLIOGRAPHY_PATH = path.join(process.cwd(), "public/references.bib");
const CSL_PATH = path.join(process.cwd(), "public/citation-style-nature.csl");
const TEMPLATE_NAME = "cal-adapt-nature";

interface CiteRecord {
  id: string;
}

interface CiteInstance {
  data: CiteRecord[];
}

interface BibliographyParams {
  entry_ids: string[][];
}

interface CiteprocEngine {
  updateItems: (ids: string[]) => void;
  makeBibliography: () => [BibliographyParams, string[]];
}

interface CslPluginConfig {
  templates: {
    has: (name: string) => boolean;
    add: (name: string, template: string) => void;
  };
  engine: (data: CiteRecord[], style: string, lang: string, format: string) => CiteprocEngine;
}

interface CiteConstructor {
  new (data: string, opts?: { generateGraph?: boolean }): CiteInstance;
  plugins: {
    config: {
      get: (name: string) => CslPluginConfig;
    };
  };
}

const CiteEngine = Cite as unknown as CiteConstructor;

let cslRegistered = false;

async function loadBibliography(): Promise<string> {
  return readFile(BIBLIOGRAPHY_PATH, "utf8");
}

async function cslConfig(): Promise<CslPluginConfig> {
  const config = CiteEngine.plugins.config.get("@csl");
  if (!cslRegistered) {
    const csl = await readFile(CSL_PATH, "utf8");
    if (!config.templates.has(TEMPLATE_NAME)) {
      config.templates.add(TEMPLATE_NAME, csl);
    }
    cslRegistered = true;
  }
  return config;
}

function withBibliographyIds(entries: string[], entryIds: string[][]): string {
  const body = entries
    .map((html, index) => {
      const id = entryIds[index]?.[0];
      if (id == null) {
        return html;
      }
      return html.replace(
        '<div class="csl-entry">',
        `<div id="${bibliographyEntryId(id)}" class="csl-entry">`
      );
    })
    .join("");

  return `<div id="refs" class="references csl-bib-body">\n${body}</div>`;
}

export function bibliographyEntryId(citationKey: string): string {
  return `bib-${citationKey.toLowerCase()}`;
}

/** Wrap http(s) URLs in bibliography HTML so they render as links without a client pass. */
export function linkifyBibliographyUrls(html: string): string {
  return html.replace(
    /(<div class="csl-right-inline">)([\s\S]*?)(<\/div>)/g,
    (_match, open: string, inner: string, close: string) => {
      const linked = inner.replace(/https?:\/\/[^\s<]+/g, (url) => {
        let href = url;
        let trailing = "";
        if (href.endsWith(".")) {
          trailing = ".";
          href = href.slice(0, -1);
        }
        const escaped = href
          .replaceAll("&", "&amp;")
          .replaceAll('"', "&quot;")
          .replaceAll("<", "&lt;");
        return `<a href="${escaped}">${escaped}</a>${trailing}`;
      });
      return `${open}${linked}${close}`;
    }
  );
}

/**
 * Format selected `references.bib` keys with the same Nature CSL rehype-citation
 * uses on Guidance MDX pages.
 */
export async function formatBibliography(citationKeys: readonly string[]): Promise<string> {
  if (citationKeys.length === 0) {
    return `<div id="refs" class="references csl-bib-body"></div>`;
  }

  const [bib, config] = await Promise.all([loadBibliography(), cslConfig()]);
  const citations = new CiteEngine(bib, { generateGraph: false });
  const knownIds = new Set(citations.data.map((entry) => entry.id));
  const missing = citationKeys.filter((key) => !knownIds.has(key));
  if (missing.length > 0) {
    throw new Error(`Unknown bibliography keys: ${missing.join(", ")}`);
  }

  const citeproc = config.engine(citations.data, TEMPLATE_NAME, "en-US", "html");
  citeproc.updateItems([...citationKeys]);
  const [params, entries] = citeproc.makeBibliography();
  return linkifyBibliographyUrls(withBibliographyIds(entries, params.entry_ids));
}

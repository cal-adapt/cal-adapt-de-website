import type { CountyItem } from "@/lib/cal-adapt-api";
import { labelCmip6Scenario } from "@/lib/data-download-tool/labels/cmip6";
import { labelVariable } from "@/lib/data-download-tool/labels/variables";
import type {
  CustomizeFormKind,
  DownloadAssetRow,
  DownloadBundle,
} from "@/lib/data-download-tool/types";
import { splitStringByPeriod } from "@/utils/string";
import { normalizeDownloadUrl } from "@/utils/url";

import { humanizeToken } from "../customize/climateProfile";

function parseModelScenarioFromItemId(itemId: string): { model: string; scenario: string } {
  const parts = splitStringByPeriod(itemId);
  if (parts.length >= 3) {
    return { model: parts[1] ?? "", scenario: parts[2] ?? "" };
  }
  return { model: "", scenario: "" };
}

function pickModel(item: CountyItem): string {
  const fromProps = item.properties["cmip6:source_id"];
  if (typeof fromProps === "string" && fromProps.length > 0) {
    return fromProps;
  }
  return parseModelScenarioFromItemId(item.id).model;
}

function pickScenarioId(item: CountyItem): string {
  const fromProps = item.properties["cmip6:experiment_id"];
  if (typeof fromProps === "string" && fromProps.length > 0) {
    return fromProps;
  }
  return parseModelScenarioFromItemId(item.id).scenario;
}

/**
 * STAC `file:size` (bytes) — APIs may emit a number or a numeric string.
 */
function parseStacFileSizeBytes(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  return 0;
}

/**
 * Bytes for one STAC Item `assets` entry — try common metadata keys (providers differ).
 */
function parseStacAssetSizeBytes(raw: Record<string, unknown>): number {
  const keys = ["file:size", "file:byte_size", "size"] as const;
  for (const key of keys) {
    const n = parseStacFileSizeBytes(raw[key]);
    if (n > 0) {
      return n;
    }
  }
  return 0;
}

/**
 * Maps STAC item features to UI bundles; shape depends on collection profile (`kind`).
 */
export function mapStacItemsToDownloadBundles(
  features: CountyItem[],
  selectedVariableIds: string[],
  kind: CustomizeFormKind
): { bundles: DownloadBundle[]; totalBytes: number; allHrefs: string[] } {
  if (kind === "standard-met-year") {
    return mapStandardMetYearItems(features, selectedVariableIds);
  }
  if (kind === "typical-met-year") {
    return mapTypicalMetYearItems(features);
  }
  return mapLoca2CountyItems(features, selectedVariableIds);
}

function mapStandardMetYearItems(
  features: CountyItem[],
  selectedVariableIds: string[]
): { bundles: DownloadBundle[]; totalBytes: number; allHrefs: string[] } {
  const selected = new Set(selectedVariableIds);
  const bundleBySelection = new Map<string, DownloadBundle>();
  const seenAssetKeys = new Set<string>();
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const variableId = String(item.properties.variable ?? "");
    const variableLabelRaw = item.properties.variable_label;
    const variableLabel =
      typeof variableLabelRaw === "string" && variableLabelRaw.trim().length > 0
        ? variableLabelRaw
        : labelVariable(variableId);
    if (!selected.has(variableId)) {
      continue;
    }

    const assetEntry = item.assets.data ?? item.assets[variableId] ?? Object.values(item.assets)[0];
    if (assetEntry == null) {
      continue;
    }
    const hrefRaw = typeof assetEntry.href === "string" ? assetEntry.href : "";
    const href = normalizeDownloadUrl(hrefRaw);
    if (!href) {
      continue;
    }
    const sizeBytes = parseStacAssetSizeBytes(assetEntry as Record<string, unknown>);

    const percentileRaw = String(item.properties.percentile ?? "");
    const timePeriodRaw = String(item.properties.time_period ?? "");
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${percentileRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      bundle = {
        stacItemId: `smy-${locationRaw}-${timePeriodRaw}-${percentileRaw}`.replace(
          /[^a-z0-9-]+/gi,
          "-"
        ),
        model: humanizeToken(percentileRaw),
        scenarioLabel: humanizeToken(timePeriodRaw.replace(/-/g, " ")),
        countyName: humanizeToken(locationRaw),
        assets: [],
      };
      bundleBySelection.set(bundleKey, bundle);
    }

    const dedupeKey = `${bundleKey}\0${variableId}\0${href}`;
    if (seenAssetKeys.has(dedupeKey)) {
      continue;
    }
    seenAssetKeys.add(dedupeKey);

    bundle.assets.push({
      variableId,
      label: variableLabel,
      href,
      sizeBytes,
    });
    totalBytes += sizeBytes;
    allHrefs.push(href);
  }

  const bundles = Array.from(bundleBySelection.values()).filter((b) => b.assets.length > 0);
  bundles.sort((a, b) => a.stacItemId.localeCompare(b.stacItemId));

  return { bundles, totalBytes, allHrefs };
}

function mapLoca2CountyItems(
  features: CountyItem[],
  selectedVariableIds: string[]
): { bundles: DownloadBundle[]; totalBytes: number; allHrefs: string[] } {
  const selected = new Set(selectedVariableIds);
  const bundles: DownloadBundle[] = [];
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const assets: DownloadAssetRow[] = [];

    for (const variableId of Object.keys(item.assets)) {
      if (!selected.has(variableId)) {
        continue;
      }
      const raw = item.assets[variableId];
      const hrefRaw = typeof raw.href === "string" ? raw.href : "";
      const href = normalizeDownloadUrl(hrefRaw);
      if (!href) {
        continue;
      }
      const sizeBytes = parseStacAssetSizeBytes(raw as Record<string, unknown>);
      const rawRecord = raw as Record<string, unknown>;
      const variableLabel =
        typeof rawRecord.variable_label === "string" ? rawRecord.variable_label.trim() : "";
      const label = variableLabel || raw.title?.trim() || labelVariable(variableId);

      assets.push({
        variableId,
        label,
        href,
        sizeBytes,
      });
      totalBytes += sizeBytes;
      allHrefs.push(href);
    }

    if (assets.length === 0) {
      continue;
    }

    const scenarioId = pickScenarioId(item);
    const county = String(item.properties.county_name ?? item.properties.countyname ?? "");

    bundles.push({
      stacItemId: item.id,
      model: pickModel(item),
      scenarioLabel: labelCmip6Scenario(scenarioId),
      countyName: county,
      assets,
    });
  }

  bundles.sort((a, b) => a.stacItemId.localeCompare(b.stacItemId));

  return { bundles, totalBytes, allHrefs };
}

function mapTypicalMetYearItems(features: CountyItem[]): {
  bundles: DownloadBundle[];
  totalBytes: number;
  allHrefs: string[];
} {
  const bundleBySelection = new Map<string, DownloadBundle>();
  const seenAssetKeys = new Set<string>();
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const modelRaw = String(item.properties.model ?? "");
    const timePeriodRaw = String(item.properties.time_period ?? "");
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${modelRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      bundle = {
        stacItemId: `tmy-${locationRaw}-${modelRaw}-${timePeriodRaw}`.replace(/[^a-z0-9-]+/gi, "-"),
        model: humanizeToken(modelRaw),
        scenarioLabel: humanizeToken(timePeriodRaw.replace(/-/g, " ")),
        countyName: humanizeToken(locationRaw),
        assets: [],
      };
      bundleBySelection.set(bundleKey, bundle);
    }

    for (const [assetKey, raw] of Object.entries(item.assets)) {
      const hrefRaw = typeof raw.href === "string" ? raw.href : "";
      const href = normalizeDownloadUrl(hrefRaw);
      if (!href) {
        continue;
      }
      const sizeBytes = parseStacAssetSizeBytes(raw as Record<string, unknown>);
      const fileTypeLabel = /^[a-z0-9]{2,5}$/i.test(assetKey)
        ? assetKey.toUpperCase()
        : humanizeToken(assetKey);
      const dedupeKey = `${bundleKey}\0${assetKey}\0${href}`;
      if (seenAssetKeys.has(dedupeKey)) {
        continue;
      }
      seenAssetKeys.add(dedupeKey);

      bundle.assets.push({
        variableId: assetKey,
        label: fileTypeLabel,
        href,
        sizeBytes,
      });
      totalBytes += sizeBytes;
      allHrefs.push(href);
    }
  }

  const bundles = Array.from(bundleBySelection.values()).filter((b) => b.assets.length > 0);
  bundles.sort((a, b) => a.stacItemId.localeCompare(b.stacItemId));
  return { bundles, totalBytes, allHrefs };
}

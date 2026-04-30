import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import type {
  ItemSearchFilters,
  StacCollection,
  StacCollectionQueryables,
  StacItem,
} from "@/lib/cal-adapt-api";

import type {
  CustomizeFormConfig,
  CustomizeFormKind,
  CustomizeSelections,
  DownloadBundle,
  PackageId,
} from "../types";

export interface PackageBundleMapResult {
  bundles: DownloadBundle[];
  totalBytes: number;
  allHrefs: string[];
}

export interface PackageMessages {
  /** Shown when the user hasn't selected enough fields to run a search. */
  skipped: string;
  /** Shown when STAC search succeeds with zero items. */
  empty: string;
  /** Column headers for the per-variable (or per-file-type) table inside each bundle card. */
  variableTableHeaders: { metric: string; download: string };
}

export interface PackageRailInfo {
  title: string;
  /** One-line blurb in the package rail. */
  listDescription: string;
}

/**
 * Declarative config for one editable row in the Customize step. Each adapter
 * exposes an array of these in `PackageAdapter.fields`; the shared renderer turns
 * them into form controls, and `buildSummaryRows` derives review-step text rows
 * from the same array — so edit view and review view cannot drift.
 *
 * Callbacks are lenses over `CustomizeFormConfig` (for option pools) and
 * `CustomizeSelections` (for the user's current picks).
 */
interface BaseFieldConfig {
  /** Display label; also used as the key into per-kind `tooltipByLabel` maps. */
  label: string;
  placeholder?: string;
}

export interface MultiSelectFieldConfig extends BaseFieldConfig {
  kind: "multi";
  /** Defaults to `true`; set to `false` for optional multi-selects. */
  required?: boolean;
  options: (config: CustomizeFormConfig) => MultiSelectOption[];
  value: (selections: CustomizeSelections) => string[];
  patch: (next: string[]) => Partial<CustomizeSelections>;
}

export interface SingleSelectFieldConfig extends BaseFieldConfig {
  kind: "single";
  options: (config: CustomizeFormConfig) => SelectOption[];
  value: (selections: CustomizeSelections) => string;
  patch: (next: string) => Partial<CustomizeSelections>;
}

export type CustomizeFieldConfig = MultiSelectFieldConfig | SingleSelectFieldConfig;

/**
 * Single source of truth for a Data Download package. Each package owns its STAC plumbing,
 * customize form, search filters, item → bundle mapping, validation, editable-field
 * layout, and display copy. Adding a new package means creating one adapter and
 * registering it.
 */
export interface PackageAdapter {
  /** App-level id used in routes and the rail. */
  id: PackageId;
  /** Discriminator for view-layer branching (customize form kind / tooltip copy / etc.). */
  kind: CustomizeFormKind;
  /** STAC collection id backing this package. */
  stacCollectionId: string;
  /** Collection lives on the STAC API v2 host. */
  useStacV2: boolean;
  /** Customize form builder needs `/queryables` enums (typical on v2 PgSTAC). */
  needsQueryables: boolean;

  rail: PackageRailInfo;
  messages: PackageMessages;

  /** Build the Customize step configuration from STAC inputs. */
  buildCustomizeForm(
    collection: StacCollection,
    queryables?: StacCollectionQueryables
  ): CustomizeFormConfig;

  /** Build CQL2 filter fragments for STAC `/search`. */
  buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters;

  /**
   * Stable string key over only the selection fields that affect this package's
   * search + mapping. Used as a React effect dep so keystroke-level changes to
   * unrelated fields don't re-register the download effect.
   */
  searchFiltersKey(selections: CustomizeSelections): string;

  /**
   * Map STAC item features into UI bundles. Adapters narrow `properties` /
   * `assets` access to the shape their collection actually returns.
   */
  mapItemsToBundles(features: StacItem[], selections: CustomizeSelections): PackageBundleMapResult;

  /** Whether selections are complete enough to run `/search`. */
  validateSelections(selections: CustomizeSelections): boolean;

  /**
   * Declarative editable-field layout for the Customize step, in render order. Also
   * drives review-step summary rows via `buildSummaryRows` so the two views can't
   * drift.
   */
  fields: readonly CustomizeFieldConfig[];

  /** Slug used as the "all files" zip filename fragment (frequency / time-period flavored). */
  zipFilenameSlug(selections: CustomizeSelections, customizeForm: CustomizeFormConfig): string;
}

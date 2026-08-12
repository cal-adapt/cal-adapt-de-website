import type { MultiSelectOptions, SelectOption } from "@/components/common/form";
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
 * One editable row in the Customize step. Each adapter lists these in
 * `PackageAdapter.fields`; the renderer draws them as form controls, and
 * `buildSummaryRows` reuses the same list for the review step.
 *
 * `options` and `patch` receive the current `CustomizeFormConfig` and
 * `CustomizeSelections`, so a field can react to other fields. For example, TMY
 * only offers Historical when ERA5 is selected, and clears invalid GWLs when the
 * model changes.
 */
interface BaseFieldConfig {
  /** Display label; also the key into per-kind `tooltipByLabel` maps. */
  label: string;
  placeholder?: string;
  /**
   * Return `false` to hide this field (in both the form and the review summary).
   * Lets a package show only the relevant fields — e.g. Standard Year shows either
   * GWLs or Years depending on the computation approach. Always shown by default.
   */
  visible?: (selections: CustomizeSelections) => boolean;
}

export interface MultiSelectFieldConfig extends BaseFieldConfig {
  kind: "multi";
  /** Defaults to `true`; set to `false` for optional multi-selects. */
  required?: boolean;
  /**
   * A flat option list or a list of option groups (rendered with section headers
   * in the dropdown). Both shapes flow through the same selection state.
   */
  options: (config: CustomizeFormConfig, selections: CustomizeSelections) => MultiSelectOptions;
  value: (selections: CustomizeSelections) => string[];
  /** Returns the selection patch (before-change state in `selections`). */
  patch: (next: string[], selections: CustomizeSelections) => Partial<CustomizeSelections>;
}

export interface SingleSelectFieldConfig extends BaseFieldConfig {
  kind: "single";
  options: (config: CustomizeFormConfig, selections: CustomizeSelections) => SelectOption[];
  value: (selections: CustomizeSelections) => string;
  patch: (next: string, selections: CustomizeSelections) => Partial<CustomizeSelections>;
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
  /** Customize form builder needs `/queryables` enums (typical on PgSTAC). */
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
  mapItemsToBundles(
    features: StacItem[],
    selections: CustomizeSelections,
    customizeForm?: CustomizeFormConfig
  ): PackageBundleMapResult;

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

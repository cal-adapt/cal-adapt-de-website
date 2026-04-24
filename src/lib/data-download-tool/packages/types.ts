import type {
  CountyItem,
  ItemSearchFilters,
  StacCollection,
  StacCollectionQueryables,
} from "@/lib/cal-adapt-api";

import type {
  CustomizeFormConfig,
  CustomizeFormKind,
  CustomizeSelections,
  DataDownloadWorkspaceData,
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
 * Single source of truth for a Data Download package. Each package owns its STAC plumbing,
 * customize form, search filters, item → bundle mapping, validation, summary rows, and
 * display copy. Adding a new package means creating one adapter and registering it.
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
   * unrelated fields (e.g. aggregation) don't re-register the download effect.
   */
  searchFiltersKey(selections: CustomizeSelections): string;

  /** Map STAC item features into UI bundles. */
  mapItemsToBundles(
    features: CountyItem[],
    selections: CustomizeSelections
  ): PackageBundleMapResult;

  /** Whether selections are complete enough to run `/search`. */
  validateSelections(selections: CustomizeSelections): boolean;

  /** Read-only summary rows for the Download step (defaults + user selections). */
  buildSummaryRows(
    workspace: DataDownloadWorkspaceData,
    selections: CustomizeSelections
  ): { label: string; value: string }[];

  /** Slug used as the "all files" zip filename fragment (frequency / time-period flavored). */
  zipFilenameSlug(selections: CustomizeSelections, customizeForm: CustomizeFormConfig): string;
}

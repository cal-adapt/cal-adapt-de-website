"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ArrowLeft, CloudCheck, Download, RotateCcw } from "lucide-react";

import ToolPageLayout from "@/components/common/layout/ToolPageLayout";
import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import Link from "@/components/common/ui/Link";
import { useStacDownloadSearch, type UseStacDownloadSearchResult } from "@/hooks";
import { analytics } from "@/lib/analytics";
import {
  type CustomizeSelections,
  type DataDownloadWorkspaceData,
  type DownloadAssetRow,
  type DownloadBundle,
  hasCompleteStacSearchSelections,
} from "@/lib/data-download-tool";
import { getTodaysDateAsString } from "@/utils/date";
import { downloadFile, downloadUrlsAsZip } from "@/utils/file";
import { formatBytes } from "@/utils/format";
import { extractFilenameFromURL } from "@/utils/url";

import CustomizeForm from "./CustomizeForm";
import DownloadScreen from "./DownloadScreen";
import PackageRail from "./PackageRail";
import { type FlowStep } from "./packages";
import ToolScreenContainer from "./ToolScreenContainer";
import WorkspaceDatasetLead from "./WorkspaceDatasetLead";
import WorkspaceLayout from "./WorkspaceLayout";

import styles from "./DataDownload.module.scss";

const ZIP_FALLBACK_NOTICE =
  "These files could not be bundled into one zip in the browser. Each file is downloading separately instead.";

function buildZipFilename(freqSlug: string, suffix?: string): string {
  const date = getTodaysDateAsString();
  const tail = suffix ? `-${suffix}` : "";
  return `data-download-bundle-${date}-${freqSlug}${tail}.zip`;
}

export interface DataDownloadProps {
  workspace: DataDownloadWorkspaceData;
}

function DownloadEstimatedBundleLine({ search }: { search: UseStacDownloadSearchResult }) {
  if (search.status !== "success" && search.status !== "loading") {
    return null;
  }

  const hasBundlesWithoutSizes =
    search.status === "success" && search.bundles.length > 0 && search.totalBytes === 0;

  return (
    <p className={styles.downloadEstimatedBundle} aria-live="polite">
      {search.status === "loading"
        ? "Calculating bundle size…"
        : hasBundlesWithoutSizes
          ? "Estimated bundle size: unavailable"
          : `Estimated bundle size: ${formatBytes(search.totalBytes)}`}
    </p>
  );
}

function frequencySlug(
  workspace: DataDownloadWorkspaceData,
  selections: CustomizeSelections
): string {
  if (workspace.customizeForm.kind === "standard-met-year") {
    const slug =
      selections.timePeriods.join("-").replace(/\s+/g, "-") ||
      selections.percentiles.join("-") ||
      "standard-met-year";
    return slug.toLowerCase().replace(/[^a-z0-9-]+/gi, "-");
  }
  const opt = workspace.customizeForm.frequencyOptions.find(
    (o) => o.value === selections.frequency
  );
  if (opt?.label) {
    return opt.label.toLowerCase().replace(/\s+/g, "-");
  }
  return selections.frequency;
}

export default function DataDownload({ workspace }: DataDownloadProps) {
  const [step, setStep] = useState<FlowStep>("customize");
  const [customizeFormKey, setCustomizeFormKey] = useState(0);
  const [selections, setSelections] = useState<CustomizeSelections>(() => ({
    ...workspace.customizeForm.initial,
  }));
  const [customizeIncomplete, setCustomizeIncomplete] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipFallbackNotice, setZipFallbackNotice] = useState<string | null>(null);

  const search = useStacDownloadSearch(workspace, selections, step === "download");

  useEffect(() => {
    if (step !== "download") {
      setZipFallbackNotice(null);
    }
  }, [step]);

  const freqSlug = useMemo(() => frequencySlug(workspace, selections), [workspace, selections]);

  const handleDownloadAll = useCallback(async () => {
    if (search.allHrefs.length === 0) {
      return;
    }
    setZipBusy(true);
    setZipFallbackNotice(null);
    try {
      const name = buildZipFilename(freqSlug);
      const { usedZip } = await downloadUrlsAsZip(search.allHrefs, name);
      analytics.trackDownload(name, usedZip ? "zip" : "zip-fallback");
      if (!usedZip) {
        setZipFallbackNotice(ZIP_FALLBACK_NOTICE);
      }
    } finally {
      setZipBusy(false);
    }
  }, [search.allHrefs, freqSlug]);

  const handleDownloadBundle = useCallback(
    async (bundle: DownloadBundle) => {
      const urls = bundle.assets.map((a) => a.href);
      if (urls.length === 0) {
        return;
      }
      setZipBusy(true);
      setZipFallbackNotice(null);
      try {
        const suffix = `${bundle.model}-${bundle.countyName}`
          .replace(/[^a-z0-9-]+/gi, "-")
          .toLowerCase()
          .slice(0, 48);
        const name = buildZipFilename(freqSlug, suffix);
        const { usedZip } = await downloadUrlsAsZip(urls, name);
        analytics.trackDownload(name, usedZip ? "zip" : "zip-fallback");
        if (!usedZip) {
          setZipFallbackNotice(ZIP_FALLBACK_NOTICE);
        }
      } finally {
        setZipBusy(false);
      }
    },
    [freqSlug]
  );

  const handleDownloadAsset = useCallback((asset: DownloadAssetRow) => {
    const filename = extractFilenameFromURL(asset.href);
    downloadFile(asset.href, filename);
    analytics.trackDownload(filename, "netcdf");
  }, []);

  const downloadAllDisabled =
    zipBusy || search.status !== "success" || search.allHrefs.length === 0;

  const toolScreenHeading = workspace.datasetTitle.trim() || "Data download";

  return (
    <ToolPageLayout title="Data Download Tool">
      <div className={styles.pageTop}>
        <div className={styles.introTexts}>
          <p className={styles.toolIntro}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris.
          </p>
        </div>
        <Alert severity="info">
          Looking for the full LOCA2 scientific data at daily resolution for the entire state of
          California?{" "}
          <Link href="https://analytics.cal-adapt.org/data/access/">
            Click here for the how-to-guide
          </Link>
        </Alert>
      </div>

      <WorkspaceLayout packageRail={<PackageRail activePackageId={workspace.catalogPackageId} />}>
        {step === "customize" ? (
          <ToolScreenContainer
            title={toolScreenHeading}
            belowHeading={<WorkspaceDatasetLead workspace={workspace} />}
            actions={
              <div className={styles.titleActions}>
                <Button
                  type="button"
                  variant="secondary"
                  prefix={<RotateCcw size={16} strokeWidth={2} aria-hidden />}
                  onClick={() => {
                    setCustomizeFormKey((k) => k + 1);
                    setSelections({ ...workspace.customizeForm.initial });
                    setCustomizeIncomplete(false);
                  }}
                >
                  Reset to defaults
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  prefix={<CloudCheck size={16} strokeWidth={2} aria-hidden />}
                  onClick={() => {
                    if (
                      !hasCompleteStacSearchSelections(selections, workspace.customizeForm.kind)
                    ) {
                      setCustomizeIncomplete(true);
                      return;
                    }
                    setCustomizeIncomplete(false);
                    setStep("download");
                  }}
                >
                  Continue to download
                </Button>
              </div>
            }
          >
            <CustomizeForm
              key={customizeFormKey}
              config={workspace.customizeForm}
              value={selections}
              showFieldErrors={customizeIncomplete}
              onChange={(next) => {
                setSelections(next);
                if (
                  customizeIncomplete &&
                  hasCompleteStacSearchSelections(next, workspace.customizeForm.kind)
                ) {
                  setCustomizeIncomplete(false);
                }
              }}
            />
          </ToolScreenContainer>
        ) : null}
        {step === "download" ? (
          <ToolScreenContainer
            title={toolScreenHeading}
            belowHeading={
              <>
                <WorkspaceDatasetLead workspace={workspace} />
                {zipFallbackNotice ? (
                  <Alert severity="info" className={styles.downloadZipFallback}>
                    {zipFallbackNotice}
                  </Alert>
                ) : null}
                <DownloadEstimatedBundleLine search={search} />
              </>
            }
            actions={
              <div className={styles.titleActions}>
                <Button
                  type="button"
                  variant="secondary"
                  prefix={<ArrowLeft size={16} strokeWidth={2} aria-hidden />}
                  onClick={() => {
                    setStep("customize");
                    setCustomizeIncomplete(false);
                  }}
                >
                  Back to customize
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={downloadAllDisabled}
                  prefix={<Download size={16} strokeWidth={2} aria-hidden />}
                  onClick={() => void handleDownloadAll()}
                >
                  Download all
                </Button>
              </div>
            }
          >
            <DownloadScreen
              workspace={workspace}
              selections={selections}
              search={search}
              onDownloadBundle={handleDownloadBundle}
              onDownloadAsset={handleDownloadAsset}
              downloadsDisabled={zipBusy}
            />
          </ToolScreenContainer>
        ) : null}
      </WorkspaceLayout>
    </ToolPageLayout>
  );
}

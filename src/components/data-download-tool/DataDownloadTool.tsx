// DataDownload
// Main component for the Cal-Adapt Data Download Tool.
// Allows users to select a data package, customize options, and download climate datasets in bulk.

"use client";

import { useCallback, useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import WatchLaterOutlined from "@mui/icons-material/WatchLaterOutlined";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { downloadZip } from "client-zip";
import clsx from "clsx";

import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import SidePanel from "@/components/dashboard/SidePanel";
import PackageForm from "@/components/data-download-tool/PackageForm";
import { useSidePanel } from "@/context/SidePanelContext";
import { dataPackages } from "@/data/data-download/data-packages";
import { DownloadableAsset, DownloadItem } from "@/data/data-download/types";
import {
  filterByFlag,
  lookupValue,
  modelsGenUseLookupTable,
  scenariosLookupTable,
  variablesLookupTable,
} from "@/data/lookup-tables";
import useDidMountEffect from "@/hooks/use-did-mount-effect";
import useLocalStorageState from "@/hooks/use-local-storage-state";
import { analytics } from "@/lib/analytics";
import { calAdaptApi, type ItemSearchFilters, type StacCollection } from "@/lib/cal-adapt-api";
import { getTodaysDateAsString } from "@/utils/date";
import { downloadFile } from "@/utils/file";
import { formatBytes } from "@/utils/format";
import { createOrStatement } from "@/utils/query";
import { arrayToCommaSeparatedString, splitStringByPeriod, stringToArray } from "@/utils/string";
import { extractFilenameFromURL } from "@/utils/url";

import styles from "./DataDownloadTool.module.scss";

type DataDownloadProps = {
  data: StacCollection;
};

export default function DataDownload({ data }: DataDownloadProps) {
  const { open, toggleOpen } = useSidePanel();

  // Data and API response states
  const [dataResponse, setDataResponse] = useState<DownloadItem[]>([]);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [totalDataSize, setTotalDataSize] = useState<number>(0);
  const [nextPageUrl, setNextPageUrl] = useState<string>("");

  // API parameter states
  const [apiParams, setApiParams] = useState<ItemSearchFilters>({
    collectionFilter: "",
    scenarioFilter: "",
    countyFilter: "",
    modelFilter: "",
  });
  const [apiParamsChanged, setApiParamsChanged] = useState<boolean>(false);
  useEffect(() => {
    setApiParamsChanged(true);
    setDataResponse([]); // Clear previous data
  }, [apiParams]);

  function updateApiParams(newParams: Partial<ItemSearchFilters>) {
    setApiParams((prevParams) => ({
      ...prevParams,
      ...newParams,
    }));
  }

  // UI and sidebar state
  const [sidebarState, setSidebarState] = useState<string>("");
  const [overwriteDialogOpen, openOverwriteDialog] = useState<boolean>(false);
  const [isDataDaily, setIsDataDaily] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBundling, setIsBundling] = useState(false);
  const [tentativePackage, setTentativePackage] = useState<number>(-1);

  // Local storage and package selection
  const [isPackageStored, setIsPkgStored] = useLocalStorageState<boolean>("isPackageStored", false);
  const [selectedPackage, setSelectedPackage] = useState<number>(-1);
  // TODO: Memoize localpackagesettings
  const [localPackageSettings, setPackageSettings] = useLocalStorageState<any>("package", {
    id: -1,
    dataset: "",
    scenarios: "",
    models: "",
    vars: "",
    boundaryType: "",
    boundaries: "",
    frequency: "",
    dataFormat: "",
    rangeStart: "",
    rangeEnd: "",
    units: "",
  });

  // Frequency selection
  const frequenciesList: string[] = ["Daily", "Monthly"];

  const [selectedFrequency, setSelectedFrequency] = useState<string>("");

  const [collectionStr, setCollectionStr] = useState<string>("");

  useEffect(() => {
    setPackageSettings({
      ...localPackageSettings,
      frequency: selectedFrequency,
    });

    if (selectedFrequency == "Monthly") {
      setIsDataDaily(false);
      setCollectionStr("loca2-mon-county");
    } else if (selectedFrequency == "Daily") {
      setIsDataDaily(true);
      setCollectionStr("loca2-day-county");
    }
  }, [selectedFrequency]);

  // Variable selection
  if (!Array.isArray(data?.summaries?.["cmip6:variable_id"])) {
    console.warn("Unexpected data structure");
  }

  const varsList: string[] = data.summaries["cmip6:variable_id"].map((obj: {}) => obj) ?? [];

  const [selectedVars, setSelectedVars] = useState<any>([]);
  useDidMountEffect(() => {
    const selectedVarsStr = arrayToCommaSeparatedString(selectedVars);

    setPackageSettings({
      ...localPackageSettings,
      vars: selectedVarsStr,
    });
  }, [selectedVars]);

  // Data download functions
  const onFormDataSubmit = async () => {
    if (apiParamsChanged) {
      // TODO: Remove state management from loop
      try {
        const data = await calAdaptApi.stac.searchItems({
          collectionFilter: apiParams?.collectionFilter,
          scenarioFilter: apiParams?.scenarioFilter,
          countyFilter: apiParams?.countyFilter,
          modelFilter: apiParams?.modelFilter,
        });

        const apiResponseData: DownloadItem[] = [];

        for (const modelIdx in data.features) {
          // For each model in data response
          const assets = data.features[modelIdx].assets;

          const varsInModel: DownloadItem = {
            model: "",
            countyname: "",
            scenario: "",
            vars: [],
          };

          // For each variable in models
          for (const asset in assets) {
            const varInVars: DownloadableAsset = {
              name: "",
              href: "",
              size: 0,
            };

            varInVars.name = asset;
            setDownloadLinks((prevState) => [...prevState, assets[asset].href]);
            varInVars.href = assets[asset].href;
            varInVars.size = assets[asset]["file:size"];
            setTotalDataSize((totalDataSize) => totalDataSize + varInVars.size);
            varsInModel.vars.push(varInVars);
          }

          const modelScenarioStr = data.features[modelIdx].id;
          const modelScenarioStrArr = splitStringByPeriod(modelScenarioStr);

          varsInModel.model = modelScenarioStrArr.length >= 0 ? modelScenarioStrArr[1] : "";
          varsInModel.scenario = modelScenarioStrArr.length >= 0 ? modelScenarioStrArr[2] : "";
          varsInModel.countyname = data.features[modelIdx].properties.countyname;
          apiResponseData.push(varsInModel);
        }

        if (data.links[0].rel == "next") {
          setNextPageUrl(data.links[0].href || null);
        }

        setDataResponse(apiResponseData);
      } catch (error) {
        console.error(error);
      }
      setApiParamsChanged(false);
    }
  };

  function handleOverwriteDialog(overwrite: boolean) {
    if (overwrite) {
      openOverwriteDialog(false);
      setSelectedPackage(tentativePackage);
      savePackageToLocal();
    } else {
      openOverwriteDialog(false);
      setTentativePackage(-1);
    }
  }

  function savePackageToLocal() {
    if (tentativePackage >= 0) {
      setPackageSettings({
        id: dataPackages[tentativePackage].id,
        dataset: dataPackages[tentativePackage].dataset,
        scenarios: dataPackages[tentativePackage].scenarios,
        models: dataPackages[tentativePackage].models,
        vars: dataPackages[tentativePackage].vars,
        boundaryType: dataPackages[tentativePackage].boundaryType,
        boundaries: "",
        frequency: dataPackages[tentativePackage].frequency,
        dataFormat: dataPackages[tentativePackage].dataFormat,
        rangeStart: dataPackages[tentativePackage].rangeStart,
        rangeEnd: dataPackages[tentativePackage].rangeEnd,
        units: dataPackages[tentativePackage].units,
        disabled: dataPackages[tentativePackage].disabled,
      });

      setSelectedVars(stringToArray(dataPackages[selectedPackage].vars));
      setModelsSelected(stringToArray(dataPackages[selectedPackage].models));
      setSelectedScenarios(stringToArray(dataPackages[selectedPackage].scenarios));
      setSelectedCounties([]);
      setIsPkgStored(true);
      setSidebarState("settings");
      toggleOpen();
    }
  }

  function handleLocalPackageClear() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.clear();
      setIsPkgStored(false);
      setSidebarState("settings");
    }
  }

  // Utility functions
  const createZip = useCallback(
    async (links: string[], name: string) => {
      showLoadingIndicator();

      const urlResponses = await Promise.all(links.map((url) => fetch(url)));

      const files = await Promise.all(
        urlResponses.map(async (response) => {
          const fileData = await response.blob();
          const fileName = extractFilenameFromURL(response.url);
          return { name: fileName, input: fileData };
        })
      );

      const blob = await downloadZip(files).blob();
      const todaysDateAsString: string = getTodaysDateAsString();

      const outputPath =
        "data-download-bundle-" +
        `${todaysDateAsString}` +
        "-" +
        selectedFrequency +
        (name ? "-" + name : "") +
        ".zip";

      hideLoadingIndicator();

      const blobUrl = URL.createObjectURL(blob);
      downloadFile(blobUrl, outputPath);

      analytics.trackDownload(outputPath, "zip");
    },
    [selectedFrequency]
  ); // include deps here

  function showLoadingIndicator() {
    setIsLoading(true);
    setIsBundling(true);
  }

  function hideLoadingIndicator() {
    setIsLoading(false);
    setIsBundling(false);
  }

  function resetStateToSettings(): void {
    setSidebarState("settings");
  }

  // County selection

  const countiesList: string[] = data.summaries["countyname"].map((obj: {}) => obj);

  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  useEffect(() => {
    let selectedCountiesStr: string = "";

    if (selectedCounties.length > 0) {
      selectedCountiesStr = arrayToCommaSeparatedString(selectedCounties);
    }

    setPackageSettings({
      ...localPackageSettings,
      boundaries: selectedCountiesStr,
    });
  }, [selectedCounties]);

  // Model selection

  const modelsList: string[] = data.summaries["cmip6:source_id"].map((obj: {}) => obj);
  const genUseModelsList: string[] = filterByFlag(modelsGenUseLookupTable);

  const [modelsSelected, setModelsSelected] = useState<string[]>([]);

  useEffect(() => {
    let selectedModelsStr: string = "";

    if (modelsSelected.length > 0) {
      selectedModelsStr = arrayToCommaSeparatedString(modelsSelected);
    }

    setPackageSettings({
      ...localPackageSettings,
      models: selectedModelsStr,
    });
  }, [modelsSelected]);

  // Scenario selection
  const scenariosList: string[] = data.summaries["cmip6:experiment_id"].map((obj: {}) => obj);

  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  useDidMountEffect(() => {
    let selectedScenariosStr: string = "";

    if (selectedScenarios.length > 0) {
      selectedScenariosStr = arrayToCommaSeparatedString(selectedScenarios);
    }

    setPackageSettings({
      ...localPackageSettings,
      scenarios: selectedScenariosStr,
    });
  }, [selectedScenarios]);

  function selectPackageToSave(id: number) {
    setTentativePackage(id);

    if (isPackageStored) {
      openOverwriteDialog(true);
    } else {
      setSelectedPackage(id);
      savePackageToLocal();
    }
  }

  useEffect(() => {
    // Update apiParams whenever selectedCounties, selectedScenarios, or modelsSelected change

    updateApiParams({
      countyFilter: createOrStatement("countyname", selectedCounties),
      scenarioFilter: createOrStatement("cmip6:experiment_id", selectedScenarios),
      modelFilter: createOrStatement("cmip6:source_id", modelsSelected),
      collectionFilter: "collection='" + collectionStr + "'",
    });
  }, [selectedCounties, selectedScenarios, modelsSelected, collectionStr]);

  useEffect(() => {
    setSelectedPackage(
      parseInt(localPackageSettings.id) >= 0 ? parseInt(localPackageSettings.id) : -1
    );
    setSelectedVars(
      localPackageSettings.vars.length > 0 ? stringToArray(localPackageSettings.vars) : []
    );
    setSelectedFrequency(
      localPackageSettings.frequency !== "" ? localPackageSettings.frequency : "Monthly"
    );
    setModelsSelected(
      localPackageSettings.models.length > 0 ? stringToArray(localPackageSettings.models) : []
    );
    setSelectedScenarios(
      localPackageSettings.scenarios.length > 0 ? stringToArray(localPackageSettings.scenarios) : []
    );
    setSelectedCounties(
      localPackageSettings.boundaries.length > 0
        ? stringToArray(localPackageSettings.boundaries)
        : []
    );
    setSidebarState("settings");
  }, []);

  return (
    <div className={styles.container}>
      {/** Alerts */}
      <div className="alerts alerts-50">
        <Alert variant="primaryBlue" ariaLabel="Where to go for full LOCA2 scientific data">
          Looking for the full LOCA2 scientific data at daily resolution for the entire state of
          California?
          <Button variant="secondary" href="https://analytics.cal-adapt.org/data/access/">
            Click here for the how-to-guide
          </Button>
        </Alert>
        <Alert variant="infoYellow">
          The Cal-Adapt data download tool is a beta tool. Feedback or questions are always welcome.
          <Tooltip
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            title="Email analytics@cal-adapt.org"
            placement="right-end"
          >
            <Button variant="secondary" href="mailto:analytics@cal-adapt.org">
              Contact us
            </Button>
          </Tooltip>
        </Alert>
      </div>

      <Alert className="alerts alerts-100" variant="secondaryReversed" style={{ marginBottom: 26 }}>
        The size of data packages might be very large. In that case, you may be asked for an email
        address to notify you when your package is ready for download.
      </Alert>

      {/** Packages container */}
      <div className="container container--full">
        <Typography variant="h5">Data Packages</Typography>
        <Typography variant="body1">
          Select a data package preset from the options listed below
        </Typography>
        <div className={styles.packagesGrid}>
          {dataPackages.map((pkg: any) => (
            <div className={clsx(styles.package, "container container--package")} key={pkg.id}>
              <Typography className={styles.packageName} variant="h6">
                {pkg.name}
              </Typography>
              <ul className={styles.packageSettings}>
                <li>
                  <Typography variant="body2">Dataset:</Typography> {pkg.dataset}
                </li>
                <li>
                  <Typography variant="body2">Scenarios:</Typography>
                  {stringToArray(pkg.scenarios).map(
                    (scenario, index) =>
                      " " +
                      lookupValue(scenario, scenariosLookupTable) +
                      (index !== stringToArray(pkg.scenarios).length - 1 ? "," : "")
                  )}
                </li>
                <li>
                  <Typography variant="body2">Models:</Typography> {pkg.models}
                </li>
                <li>
                  <Typography variant="body2">Vars:</Typography>
                  {stringToArray(pkg.vars).map(
                    (variable, index) =>
                      " " +
                      lookupValue(variable, variablesLookupTable) +
                      (index !== stringToArray(pkg.vars).length - 1 ? "," : "")
                  )}
                </li>
                <li>
                  <Typography variant="body2">Boundary Type:</Typography> {pkg.boundaryType}
                </li>
                <li>
                  <Typography variant="body2">Range:</Typography> {pkg.rangeStart} - {pkg.rangeEnd}
                </li>
                <li>
                  <Typography variant="body2">Frequency:</Typography> {pkg.frequency}
                </li>
                <li>
                  <Typography variant="body2">Data Format:</Typography> {pkg.dataFormat}
                </li>
                <li>
                  <Typography variant="body2">Units:</Typography> {pkg.units}
                </li>
              </ul>
              {pkg.disabled && (
                <Tooltip
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                  title="This data package preset is not available"
                >
                  <span>
                    <Button disabled>Customize and download</Button>
                  </span>
                </Tooltip>
              )}
              {!pkg.disabled && (
                <Tooltip
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                  title="Continue with this data package preset"
                >
                  <span>
                    <Button onClick={() => selectPackageToSave(parseInt(pkg.id))}>
                      Customize and download
                    </Button>
                  </span>
                </Tooltip>
              )}
            </div>
          ))}
          <div className={clsx(styles.package, "container container--package flex-center-col")}>
            <WatchLaterOutlined style={{ width: "50px", height: "50px" }} />
            <Typography className={styles.packageName} variant="h6">
              Coming Soon
            </Typography>
            <Typography className={styles.packageName} variant="body2">
              We&#39;re working on building more data packages
            </Typography>
          </div>
        </div>
      </div>

      {/** Confirm package overwrite dialog */}
      <Dialog
        open={overwriteDialogOpen}
        onClose={() => handleOverwriteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm package overwrite"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you proceed, the current package data that is saved will be overwritten by the
            package that you are selecting
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleOverwriteDialog(false)}>Cancel</Button>
          <Button onClick={() => handleOverwriteDialog(true)}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/** SidePanel */}
      <SidePanel anchor="right" variant="temporary" open={open} onClose={toggleOpen}>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="Close the sidebar"
        >
          <IconButton onClick={toggleOpen}>
            <CloseIcon />
          </IconButton>
        </Tooltip>

        {isPackageStored && (
          <Tooltip
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            title="Delete stored data package"
          >
            <IconButton onClick={() => handleLocalPackageClear()}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}

        {isPackageStored && sidebarState == "download" && (
          <Tooltip
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            title="Review your package settings"
          >
            <IconButton onClick={() => resetStateToSettings()}>
              <UndoOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}

        {isPackageStored && (
          <PackageForm
            localPackageSettings={localPackageSettings}
            sidebarState={sidebarState}
            setSidebarState={setSidebarState}
            setPackageSettings={setPackageSettings}
            modelsSelected={modelsSelected}
            setModelsSelected={setModelsSelected}
            frequenciesList={frequenciesList}
            selectedFrequency={selectedFrequency}
            setSelectedFrequency={setSelectedFrequency}
            modelsList={modelsList}
            genUseModelsList={genUseModelsList}
            selectedVars={selectedVars}
            setSelectedVars={setSelectedVars}
            varsList={varsList}
            selectedCounties={selectedCounties}
            setSelectedCounties={setSelectedCounties}
            countiesList={countiesList}
            selectedScenarios={selectedScenarios}
            setSelectedScenarios={setSelectedScenarios}
            scenariosList={scenariosList}
            onFormDataSubmit={onFormDataSubmit}
            nextPageUrl={nextPageUrl}
            dataResponse={dataResponse}
            isPackageStored={isPackageStored}
            handleLocalPackageClear={handleLocalPackageClear}
            createZip={createZip}
            downloadLinks={downloadLinks}
            setDownloadLinks={setDownloadLinks}
            isDataDaily={isDataDaily}
            totalDataSize={totalDataSize}
            formatBytes={formatBytes}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isBundling={isBundling}
            setIsBundling={setIsBundling}
          ></PackageForm>
        )}

        {!isPackageStored && (
          <div className={styles.packageContents}>
            <Typography variant="h6">
              No package has been selected. Head back to the dashboard and select a data package
              preset.
            </Typography>
          </div>
        )}
      </SidePanel>
    </div>
  );
}

// VizPrmsForm
// Component for selecting parameters that define the visualization in the Renewables Visualizer.
// Allows user to select the resource type (solar or wind), global warming level (GWL), and either photovoltaic configuration (for solar)
// or wind installation design parameters (for wind).
// Uses contexts for shared state across the app.

import React, { useState, useEffect } from "react";

import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Fade from "@mui/material/Fade";
import { FormControl, Button } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";

import HtmlTooltip from "../global/HtmlTooltip";

import { usePhotoConfig } from "@/context/PhotoConfigContext";
import { useInstallationPrms } from "@/context/InstallationParamsContext";
import { useRes } from "@/context/ResContext";

import { tooltipsList } from "@/lib/tooltips";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps: any = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  getContentAnchorEl: null, // disables default anchoring for MUI v4 compatibility
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center",
  },
  variant: "menu",
};

// --- Interface for managing validation errors on form fields ---
interface FormFieldErrorStates {
  globalWarming: boolean;
  photoConfig: boolean;
  installation: boolean;
  resSelected: boolean;
}

// --- Props interface for parent-controlled state ---
interface VizFormProps {
  gwlSelected: number;
  setGwlSelected: (gwl: number) => void;
  globalWarmingLevelsList: string[];
  onFormDataSubmit: () => unknown;
  toggleOpen: () => void;
}

export default function VizPrmsForm({
  gwlSelected,
  setGwlSelected,
  globalWarmingLevelsList,
  onFormDataSubmit,
  toggleOpen,
}: VizFormProps) {
  // Context hooks
  const { photoConfigSelected, setPhotoConfigSelected, photoConfigList } =
    usePhotoConfig();
  const { installationSelected, setInstallationSelected, installationList } =
    useInstallationPrms();
  const { resSelected, setResSelected, resList } = useRes();

  // Track field validation state (not currently used but can support inline errors)
  const [formErrorState, setFormErrorState] = useState<FormFieldErrorStates>({
    globalWarming: false,
    photoConfig: false,
    resSelected: false,
    installation: false,
  });

  // Called when user submits and closes the form
  const handleSubmit = () => {
    toggleOpen();
    onFormDataSubmit();
  };

  return (
    <div className="viz-prms-form">
      <div className="package-contents">
        <Typography className="inline" variant="h5">
          Visualization Parameters
        </Typography>
        <div className="container container--white">
          <div className="option-group">
            <div className="option-group__title">
              <Typography variant="body2">Resource</Typography>
              <HtmlTooltip
                textFragment={
                  <React.Fragment>
                    <p>{tooltipsList[2].long_text}</p>
                  </React.Fragment>
                }
                iconFragment={<InfoOutlinedIcon />}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement="right-end"
              />
            </div>

            <FormControl>
              <Select
                value={resSelected}
                onChange={(event: any) => {
                  setResSelected(event.target.value as number);
                }}
                MenuProps={MenuProps}
                sx={{ mt: "15px", width: "380px" }}
              >
                {resList.map((res, i) => {
                  return (
                    <MenuItem key={res} value={i}>
                      <ListItemText primary={`${res}`} />
                    </MenuItem>
                  );
                })}
              </Select>
              {formErrorState.resSelected && (
                <div>One or more resources must be selected to continue</div>
              )}
            </FormControl>
          </div>
        </div>
        <div className="container container--white">
          <div className="option-group">
            <div className="option-group__title">
              <Typography variant="body2">Global Warming Level</Typography>
              <HtmlTooltip
                textFragment={
                  <React.Fragment>
                    <p>{tooltipsList[0].long_text}</p>
                  </React.Fragment>
                }
                iconFragment={<InfoOutlinedIcon />}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement="right-end"
              />
            </div>

            <FormControl>
              <Select
                value={gwlSelected}
                onChange={(event: any) => {
                  setGwlSelected(event.target.value as number);
                }}
                MenuProps={MenuProps}
                sx={{ mt: "15px", width: "380px" }}
              >
                {globalWarmingLevelsList.map((gwl, i) => {
                  return (
                    <MenuItem key={gwl} value={i}>
                      <ListItemText primary={`${gwl}°`} />
                    </MenuItem>
                  );
                })}
              </Select>
              {formErrorState.globalWarming && (
                <div>
                  One or more global warming levels must be selected to continue
                </div>
              )}
            </FormControl>
          </div>
        </div>
        {resSelected === 0 && ( // Solar resource - display configuration options
          <div className="container container--white">
            <div className="option-group">
              <div className="option-group__title">
                <Typography className="option-group__title" variant="body2">
                  Photovoltaic Configuration
                </Typography>
                <HtmlTooltip
                  textFragment={
                    <React.Fragment>
                      <p>
                        The set of photovoltaic system design parameters.
                        &quot;Utility&quot; is based on typical installations
                        maintained by utility companies, while
                        &quot;Distributed&quot; corresponds to a residential
                        rooftop installation.
                      </p>
                    </React.Fragment>
                  }
                  iconFragment={<InfoOutlinedIcon />}
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                  placement="right-end"
                />
              </div>

              <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group"></FormLabel>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={photoConfigSelected}
                  onChange={(event: any) => {
                    setPhotoConfigSelected(event.target.value as string);
                  }}
                >
                  {photoConfigList.map((photoConfig) => (
                    <FormControlLabel
                      value={photoConfig}
                      key={photoConfig}
                      control={<Radio />}
                      label={photoConfig}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
          </div>
        )}
        {resSelected === 1 && ( // Wind resource - display installation options
          <div className="container container--white">
            <div className="option-group">
              <div className="option-group__title">
                <Typography className="option-group__title" variant="body2">
                  Installation Design Parameters
                </Typography>
                <HtmlTooltip
                  textFragment={
                    <React.Fragment>
                      <p>
                        Turbine power curves from{" "}
                        <a href="https://github.com/NREL/reV" target="_blank">
                          NREL&apos;s Renewable Energy Potential (ReV) GitHub
                          repo
                        </a>{" "}
                        were utilized.
                      </p>
                    </React.Fragment>
                  }
                  iconFragment={<InfoOutlinedIcon />}
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                  placement="right-end"
                />
              </div>

              <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group"></FormLabel>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={installationSelected}
                  onChange={(event: any) => {
                    setInstallationSelected(event.target.value as number);
                  }}
                >
                  {installationList.map((installationOpt, idx) => (
                    <FormControlLabel
                      value={idx}
                      key={idx}
                      control={<Radio />}
                      label={installationOpt}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
          </div>
        )}

        {/**                <div className="cta">
                    <Button onClick={() => {
                        handleSubmit()
                    }} variant="contained">Refresh your visualization</Button>
                </div> */}
      </div>
    </div>
  );
};

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion, { accordionClasses, AccordionSlots } from "@mui/material/Accordion";
import AccordionDetails, { accordionDetailsClasses } from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import Icon from "@/components/common/ui/Icon";
import { mediaQueries } from "@/utils/styles";

import styles from "./Footer.module.scss";

export default function Footer() {
  const [expanded, setExpanded] = useState(false);

  const isMobile = useMediaQuery(mediaQueries.max.large);

  const handleExpansion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  return (
    <div className={styles.footer}>
      <div className={styles.left}>
        <Typography variant="body1">
          Cal-Adapt was developed by Eagle Rock Analytics and the Geospatial Innovation Facility at
          the University of California, Berkeley, with support from the Lawrence Berkeley National
          Lab. The California Energy Commission provided funding and advisory oversight.
        </Typography>
        <div className={styles.logos}>
          <Icon variant="logoERA" />
          <Icon variant="logoGIF" />
          <Icon variant="logoLBNL" />
          <Icon variant="logoCEC" />
        </div>
      </div>
      <div className={styles.right}>
        <Accordion
          className={isMobile ? "hidden" : ""}
          elevation={0}
          expanded={expanded}
          onChange={handleExpansion}
          slots={{ transition: Fade as AccordionSlots["transition"] }}
          slotProps={{ transition: { timeout: 500 } }}
          sx={[
            {
              backgroundColor: "transparent",
              color: "#fff",
              boxShadow: "none",
              flex: "start",
              "&::before": {
                display: "none", // remove the default divider line
              },
              [`& .${accordionClasses.root}`]: {
                backgroundColor: "transparent",
              },
              [`& .MuiAccordionSummary-root`]: {
                backgroundColor: "transparent",
              },
              [`& .MuiAccordionDetails-root`]: {
                backgroundColor: "transparent",
              },
            },
            expanded
              ? {
                  [`& .${accordionClasses.region}`]: {
                    height: "auto",
                  },
                  [`& .${accordionDetailsClasses.root}`]: {
                    display: "block",
                  },
                }
              : {
                  [`& .${accordionClasses.region}`]: {
                    height: 0,
                  },
                  [`& .${accordionDetailsClasses.root}`]: {
                    display: "none",
                  },
                },
          ]}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "1.5rem" }} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{
              justifyContent: "left",
              minHeight: "25px",
              paddingLeft: 0,
              paddingRight: 0,
              "&.Mui-expanded": {
                minHeight: "25px",
                height: "25px",
              },
              "& .MuiAccordionSummary-content": {
                margin: 0,
                width: "auto", // <-- prevents stretching!
                flexGrow: 0, // <-- keeps it tight to content
                alignItems: "right",
              },
              "& .MuiAccordionSummary-expandIconWrapper": {
                color: "white",
                marginLeft: "4px", // optional fine-tuning
              },
            }}
          >
            <Typography component="span" variant="caption" sx={{ fontSize: "16px" }}>
              Our Tools
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul style={{ fontSize: "14px" }}>
              <li>
                <Link href="/dashboard/data-explorer" target="_blank" rel="noopener noreferrer">
                  Data Explorer
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/renewables-visualizer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Renewables Visualizer
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/data-download-tool"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Data Download Tool
                </Link>
              </li>
            </ul>
          </AccordionDetails>
        </Accordion>
        <Typography
          variant="caption"
          sx={{ fontSize: "16px" }}
          component="a"
          href="https://cmip5.cal-adapt.org"
        >
          4th Assessment Cal-Adapt
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: "16px" }}
          component="a"
          href="https://analytics.cal-adapt.org/guidance/"
        >
          Climate Guidance
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: "16px" }}
          component="a"
          href="mailto:analytics@cal-adapt.org"
        >
          Contact Us
        </Typography>
      </div>
    </div>
  );
}

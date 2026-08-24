/**
 * Mode Selector Component
 *
 * Allows users to choose between three renewable analysis modes:
 * 1. Seasonal generation potential
 * 2. Low-generation days
 * 3. Coincident solar & wind stress
 *
 * Each mode has a clear label, description, and help text.
 */

"use client";

import React from "react";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import HtmlTooltip from "@/components/common/ui/HtmlTooltip";
import { ModeDefinition, RenewableMode } from "@/data/renewables-visualizer/dataset-adapter";

import styles from "./ModeSelector.module.scss";

interface ModeSelectorProps {
  selectedMode: RenewableMode;
  onModeChange: (mode: RenewableMode) => void;
  modes: Record<RenewableMode, ModeDefinition>;
}

export default function ModeSelector({ selectedMode, onModeChange, modes }: ModeSelectorProps) {
  return (
    <Box className={styles.container}>
      <Typography variant="h6" component="h2" gutterBottom>
        Choose an Analysis Mode
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {Object.entries(modes).map(([modeId, modeDefinition]) => {
          const isSelected = selectedMode === modeId;
          return (
            <Grid xs={12} sm={6} md={4} key={modeId}>
              <Card
                className={`${styles.modeCard} ${isSelected ? styles.selected : ""}`}
                sx={{
                  cursor: "pointer",
                  border: isSelected ? "2px solid" : "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "action.selected" : "background.paper",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 2,
                  },
                }}
                onClick={() => onModeChange(modeDefinition.id)}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {modeDefinition.label}
                      </Typography>
                      <HtmlTooltip
                        title={modeDefinition.helpText}
                        placement="top"
                        arrow
                        sx={{ cursor: "help" }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: "1.2rem", color: "action.active" }} />
                      </HtmlTooltip>
                    </Box>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {modeDefinition.shortDescription}
                  </Typography>
                  <Button
                    variant={isSelected ? "contained" : "outlined"}
                    size="small"
                    fullWidth
                    onClick={() => onModeChange(modeDefinition.id)}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

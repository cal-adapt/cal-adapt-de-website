"use client";

import React from "react";
import { usePathname } from "next/navigation";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import {
  AppBar,
  Box,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import { mediaQueries } from "@/config/breakpoints";
import { FEEDBACK_URL } from "@/config/constants";
import { navLinks } from "@/config/navigation";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { analytics } from "@/lib/analytics";
import { extractSegment } from "@/utils/url";

declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    purple: true;
    grey: true;
  }
}

const drawerWidth = 212;
interface LayoutProps {
  children: React.ReactNode;
}

const DrawerHeader = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "64px",
  padding: "0 16px",
  position: "absolute",
  top: 0,
  width: "100%",
  zIndex: 1201,
}));

const ResponsiveSidebar = styled("div")(({ theme, open }: { theme: any; open: boolean }) => ({
  width: open ? drawerWidth : theme.spacing(9),
  flexShrink: 0,
  minHeight: "100vh",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
  position: "relative",
  paddingTop: "64px",
  borderRight: "1px solid var(--color-grey-2)",
  zIndex: open ? 3 : "auto",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : theme.spacing(9),
    boxSizing: "border-box",
    minHeight: "100%",
    border: "none",
    overflowX: "hidden",
    transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
  },
}));

const menuItems = [
  { link: navLinks.climateMetricsMap, icon: <MapOutlinedIcon /> },
  { link: navLinks.dataDownload, icon: <DatasetOutlinedIcon /> },
  { link: navLinks.renewablesVisualizer, icon: <WbSunnyOutlinedIcon /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const { open, toggleLeftDrawer } = useLeftDrawer();
  const pathname = usePathname();
  const selectedPage: string | null = extractSegment(pathname, "dashboard/", "/");
  const theme = useTheme();
  const isMobile = useMediaQuery(mediaQueries.max.small);

  const renderDashboardToolbar = (): React.ReactNode => {
    switch (selectedPage) {
      case navLinks.climateMetricsMap.id:
        return (
          <DashboardToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName={navLinks.climateMetricsMap.label}
          />
        );
      case navLinks.dataDownload.id:
        return (
          <DashboardToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName={navLinks.dataDownload.label}
            tooltipTitle="Review your selected package"
            icon="package"
          />
        );
      case navLinks.renewablesVisualizer.id:
        return (
          <DashboardToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName={navLinks.renewablesVisualizer.label}
            tooltipTitle="Change your visualization parameters"
            icon="settings"
          />
        );
      default:
        return (
          <DashboardToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName="Getting Started"
            tooltipTitle="Change your visualization parameters"
            icon="package"
          />
        );
    }
  };

  return (
    <SidePanelProvider>
      {!isMobile ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            minHeight: "100vh",
            height: "100%",
          }}
        >
          <CssBaseline />
          <ResponsiveSidebar theme={theme} open={open}>
            <DrawerHeader>
              {open && <Icon variant="logoCalAdapt" style={{ height: "2em" }} />}

              <IconButton onClick={toggleLeftDrawer} aria-label="toggle drawer">
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </DrawerHeader>

            <List
              sx={{
                "& .MuiListItemIcon-root": { color: "var(--color-black)" },
                "&& .Mui-selected, && .Mui-selected:hover": {
                  bgcolor: "rgba(247, 249, 251, 0.9)",
                },
                "& .MuiListItemButton-root:hover": {
                  bgcolor: "rgba(247, 249, 251, 0.6)",
                  borderRadius: "12px",
                },
              }}
            >
              {menuItems.map((item) => (
                <ListItem key={item.link.id} disablePadding component={Link} href={item.link.href}>
                  <ListItemButton>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.link.label || "Untitled"}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <List
              sx={{
                mt: "auto",
                "& .MuiListItemIcon-root": { color: "var(--color-black)" },
                color: "var(--color-black)",
              }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setFeedbackOpen(true)}
                  sx={{
                    "&:hover": { bgcolor: "rgba(247, 249, 251, 0.6)", borderRadius: "12px" },
                  }}
                >
                  <ListItemIcon>
                    <RateReviewOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Feedback" sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>

              <Dialog
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle sx={{ textAlign: "center", fontSize: "1.75rem" }}>
                  Feedback
                  <IconButton
                    onClick={() => setFeedbackOpen(false)}
                    sx={{ position: "absolute", right: 12, top: 12 }}
                    aria-label="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent>
                  <p style={{ textAlign: "center" }}>
                    Please fill out{" "}
                    <Link
                      href={FEEDBACK_URL}
                      style={{ color: "var(--color-blue-4)" }}
                      onClick={() => analytics.trackExternalLink(FEEDBACK_URL, "feedback survey")}
                    >
                      this survey
                    </Link>{" "}
                    to share any feedback you have. Suggestions for improvements, issues with the
                    tool, or general comments are all welcome.
                  </p>
                </DialogContent>
              </Dialog>
            </List>
          </ResponsiveSidebar>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgColor: "background.default",
              p: 0,
              mt: "64px",
              transition: "margin 225ms cubic-bezier(0.4, 0, 0.6, 1)",
              overflowY: "auto",
              height: "calc(100vh - 64px)",
            }}
          >
            <AppBar
              position="fixed"
              sx={{
                width: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)`,
                ml: open ? `${drawerWidth}px` : theme.spacing(9),
                backgroundColor: "var(--color-white)",
                boxShadow: "none",
                borderBottom: "1px solid var(--color-grey-2)",
                zIndex: 1100,
              }}
            >
              {renderDashboardToolbar()}
            </AppBar>
            {children}
          </Box>
        </Box>
      ) : (
        <ErrorView
          logo
          message="Due to the nature of the tools, the Cal-Adapt Dashboard is best used on a desktop or laptop computer"
        >
          <Button href="/">Go to the homepage</Button>
        </ErrorView>
      )}
    </SidePanelProvider>
  );
}

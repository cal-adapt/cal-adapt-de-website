"use client";

import React from "react";
import Link from "next/link";
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
  Link as MuiLink,
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
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { mediaQueries } from "@/utils/styles";
import { extractSegment } from "@/utils/url";

import sidebarBg from "../../../public/img/photos/ocean-thumbnail.png";

declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    purple: true;
    grey: true;
  }
}

const drawerWidth = 212;
const FEEDBACK_URL = "https://forms.gle/PS7i5MYzF6ixdiq28";
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
  backgroundImage: `url(${sidebarBg.src})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  paddingTop: "64px",
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
  {
    text: "Data Download Tool",
    icon: <DatasetOutlinedIcon />,
    path: "/dashboard/data-download-tool",
  },
  {
    text: "Renewables Visualizer",
    icon: <WbSunnyOutlinedIcon />,
    path: "/dashboard/renewables-visualizer",
  },
  {
    text: "Data Explorer",
    icon: <MapOutlinedIcon />,
    path: "/dashboard/data-explorer",
  },
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
  const isMobile = useMediaQuery(mediaQueries.max.large);

  const renderDashboardToolbar = (): React.ReactNode => {
    switch (selectedPage) {
      case "data-download-tool":
        return (
          <DashboardToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName="Data Download Tool"
            tooltipTitle="Review your selected package"
            icon="package"
          />
        );
      case "renewables-visualizer":
        return (
          <DashboardToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName="Renewables Visualizer"
            tooltipTitle="Change your visualization parameters"
            icon="settings"
          />
        );
      case "data-explorer":
        return (
          <DashboardToolbar drawerWidth={drawerWidth} sidebarOpen={open} toolName="Data Explorer" />
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
                "& .MuiListItemIcon-root": { color: "#000" },
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
                <ListItem key={item.text} disablePadding component={Link} href={item.path}>
                  <ListItemButton>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.text || "Untitled"}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <List sx={{ mt: "auto", "& .MuiListItemIcon-root": { color: "#000" }, color: "#000" }}>
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
                    <MuiLink
                      href={FEEDBACK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#1565c0" }}
                    >
                      this survey
                    </MuiLink>{" "}
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
                backgroundColor: "#ffffff",
                boxShadow: "none",
                borderBottom: "1px solid #e8e8e8",
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

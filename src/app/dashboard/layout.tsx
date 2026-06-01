"use client";

import React from "react";
import { usePathname } from "next/navigation";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled, type Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import Appbar from "@/components/dashboard/Appbar";
import FeedbackDialog from "@/components/dashboard/FeedbackDialog";
import { dashboardTools, getDashboardToolByNavId } from "@/components/dashboard/tools";
import { mediaQueries } from "@/config/breakpoints";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { extractSegment } from "@/utils/url";

declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    purple: true;
    grey: true;
  }
}

const DRAWER_WIDTH = 212;
/** Fallback Appbar title when no tool matches the current route (e.g. `/dashboard` root). */
const DASHBOARD_ROOT_LABEL = "Getting Started";

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

const ResponsiveSidebar = styled("div")(({ theme, open }: { theme: Theme; open: boolean }) => ({
  width: open ? DRAWER_WIDTH : theme.spacing(9),
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
    width: open ? DRAWER_WIDTH : theme.spacing(9),
    boxSizing: "border-box",
    minHeight: "100%",
    border: "none",
    overflowX: "hidden",
    transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
  },
}));

export default function Layout({ children }: LayoutProps) {
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const { open, toggleLeftDrawer } = useLeftDrawer();
  const pathname = usePathname();
  const selectedPage: string | null = extractSegment(pathname, "dashboard/", "/");
  const theme = useTheme();
  const isMobile = useMediaQuery(mediaQueries.max.small);

  const selectedTool = getDashboardToolByNavId(selectedPage);

  if (isMobile) {
    return (
      <SidePanelProvider>
        <ErrorView
          logo
          message="Due to the nature of the tools, the Cal-Adapt Dashboard is best used on a desktop or laptop computer"
        >
          <Button href="/">Go to the homepage</Button>
        </ErrorView>
      </SidePanelProvider>
    );
  }

  return (
    <SidePanelProvider>
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
            {dashboardTools.map((tool) => (
              <ListItem
                key={tool.navLink.id}
                disablePadding
                component={Link}
                href={tool.navLink.href}
              >
                <ListItemButton>
                  <ListItemIcon>{tool.sidebarIcon}</ListItemIcon>
                  <ListItemText
                    primary={tool.navLink.label || "Untitled"}
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

            <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
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
              width: `calc(100% - ${open ? DRAWER_WIDTH : theme.spacing(9)}px)`,
              ml: open ? `${DRAWER_WIDTH}px` : theme.spacing(9),
              backgroundColor: "var(--color-white)",
              boxShadow: "none",
              borderBottom: "1px solid var(--color-grey-2)",
              zIndex: 1100,
            }}
          >
            <Appbar
              sidebarOpen={open}
              toolName={selectedTool?.navLink.label ?? DASHBOARD_ROOT_LABEL}
              tooltipTitle={selectedTool?.appbar?.tooltipTitle}
              icon={selectedTool?.appbar?.icon}
            />
          </AppBar>
          {children}
        </Box>
      </Box>
    </SidePanelProvider>
  );
}

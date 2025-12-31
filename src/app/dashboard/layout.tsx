"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
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
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/system";

import CalDashToolbar from "@/components/dashboard/DashboardToolbar";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { extractSegment } from "@/utils/url";

import packageIcon from "../../../public/img/icons/package.svg";
import settingsIcon from "../../../public/img/icons/settings.svg";
import logo from "../../../public/img/logos/cal-adapt-data-download.png";
import sidebarBg from "../../../public/img/photos/ocean-thumbnail.png";

import "@/styles/dashboard/dashboard.scss";

declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    purple: true;
    grey: true;
  }
}

const drawerWidth = 212;
interface LayoutProps {
  children: ReactNode;
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
  transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
  backgroundImage: `url(${sidebarBg.src})`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  paddingTop: "64px",
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
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { open, toggleLeftDrawer } = useLeftDrawer();
  const pathname = usePathname();
  const selectedPage: string | null = extractSegment(pathname, "dashboard/", "/");
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:992px)");

  const renderCalDashToolBar = (): ReactNode => {
    switch (selectedPage) {
      case "data-download-tool":
        return (
          <CalDashToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName="Data Download Tool"
            tooltipTitle="Review your selected package"
            iconSrc={packageIcon}
            iconAlt="Package icon that you can click on to see your current data package"
          />
        );
      case "renewables-visualizer":
        return (
          <CalDashToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName="Renewables Visualizer"
            tooltipTitle="Change your visualization parameters"
            iconSrc={settingsIcon}
            iconAlt="Settings icon that you can click on to change your visualization"
          />
        );
      case "data-explorer":
        return (
          <CalDashToolbar drawerWidth={drawerWidth} sidebarOpen={open} toolName="Data Explorer" />
        );
      default:
        return (
          <CalDashToolbar
            drawerWidth={drawerWidth}
            sidebarOpen={open}
            toolName="Getting Started"
            tooltipTitle="Change your visualization parameters"
            iconSrc={packageIcon}
            iconAlt="Settings icon that you can click on to change your visualization"
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
              {open && (
                <Image
                  src={logo}
                  alt="Cal Adapt California state logo"
                  style={{ height: "40px" }}
                />
              )}

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
              {renderCalDashToolBar()}
            </AppBar>
            {children}
          </Box>
        </Box>
      ) : (
        <div className="mobile-view">
          <div className="mobile-view__container">
            <Image src={logo} alt="Cal Adapt logo" className="cal-adapt-logo__mobile" />
            <Typography variant="body1">
              Due to the nature of the tools, the Cal-Adapt Dashboard is best used on a desktop or
              laptop computer
            </Typography>
            <Button variant="contained" href="https://cal-adapt.org">
              Go to the homepage
            </Button>
          </div>
        </div>
      )}
    </SidePanelProvider>
  );
}

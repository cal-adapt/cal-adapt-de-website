"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import logo from "../../../public/img/logos/cal-adapt-logo-white.svg";

const leftMenuItems = [
  {
    label: "4th Assessment Cal-Adapt",
    icon: <ArrowBackIcon sx={{ mr: 1 }} />,
    href: "https://cmip5.cal-adapt.org",
  },
];

const rightMenuItems = [
  {
    label: "Guidance",
    href: "https://analytics.cal-adapt.org/guidance/",
  },
  {
    label: "Data Docs",
    href: "https://analytics.cal-adapt.org/data/",
  },
  {
    label: "Tools",
    icon: <SpaceDashboardIcon sx={{ mr: 1 }} />,
    submenu: [
      {
        label: "Data Download Tool",
        href: "/dashboard/data-download-tool",
      },
      {
        label: "Renewables Visualizer",
        href: "/dashboard/renewables-visualizer",
      },
      {
        label: "Data Explorer",
        href: "/dashboard/data-explorer",
      },
    ],
  },
];

function Navigation() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [subMenuAnchor, setSubMenuAnchor] = useState<null | HTMLElement>(null);
  const [openSubmenuLabel, setOpenSubmenuLabel] = useState<string | null>(null);

  const handleOpenSubMenu = (label: string) => (event: React.MouseEvent<HTMLElement>) => {
    setSubMenuAnchor(event.currentTarget);
    setOpenSubmenuLabel(label);
  };

  const handleCloseSubmenu = () => {
    setSubMenuAnchor(null);
    setOpenSubmenuLabel(null);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      style={{ position: "absolute", zIndex: 3, top: 0 }}
      position="static"
      color="transparent"
      elevation={0}
    >
      <Container maxWidth={false} disableGutters>
        <Toolbar
          disableGutters
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            mx: "auto",
            justifyContent: "space-between",
            gap: "149px",
            height: 64,
            maxWidth: "1000px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <IconButton
              size="large"
              aria-label="mobile menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: "#fff" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              disableScrollLock
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {[...leftMenuItems, ...rightMenuItems].map((item) => {
                if (item.label === "Tools") {
                  return "";
                } else {
                  return (
                    <MenuItem
                      key={item.label}
                      onClick={handleCloseNavMenu}
                      component={item.href ? "a" : "button"}
                      href={item.href}
                    >
                      <Typography variant="overline" sx={{ textAlign: "center" }}>
                        {item.label}
                      </Typography>
                    </MenuItem>
                  );
                }
              })}
            </Menu>
          </Box>

          {/* Left menu items */}
          <Box
            sx={{
              flex: 1,
              display: {
                xs: "none",
                md: "flex",
              },
              gap: 2,
              alignItems: "center",
              justifyContent: "left",
              ml: "25px",
            }}
          >
            {leftMenuItems.map(({ label, icon, submenu, href }) => (
              <React.Fragment key={label}>
                {submenu ? (
                  <Button
                    onClick={handleOpenSubMenu(label)}
                    sx={{ color: "white", display: "flex", alignItems: "center" }}
                  >
                    {icon}
                    <Typography variant="overline">{label}</Typography>
                  </Button>
                ) : (
                  <Button
                    component="a"
                    href={href}
                    target="_blank"
                    sx={{ color: "white", display: "flex", alignItems: "center" }}
                  >
                    {icon}
                    <Typography variant="overline">{label}</Typography>
                  </Button>
                )}

                {submenu && openSubmenuLabel === label && (
                  <Menu
                    anchorEl={subMenuAnchor}
                    open={Boolean(subMenuAnchor)}
                    onClose={handleCloseSubmenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    disableScrollLock
                  >
                    {submenu.map((item) => (
                      <MenuItem
                        key={item.label}
                        component="a"
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Go to ${label}`}
                        onClick={handleCloseSubmenu}
                      >
                        <Typography variant="body2">{item.label}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* Center logo */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              display: "flex",
              alignItems: "center",
              height: "100%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <Image src={logo} alt="Cal Adapt California state logo" style={{ height: "40px" }} />
          </Box>

          {/* Right menu items */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "right",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            {rightMenuItems.map(({ label, icon, submenu, href }) => (
              <React.Fragment key={label}>
                {submenu ? (
                  <Button
                    onClick={handleOpenSubMenu(label)}
                    sx={{ color: "white", display: "flex", alignItems: "center" }}
                  >
                    {icon}
                    <Typography variant="overline">{label}</Typography>
                  </Button>
                ) : (
                  <Button
                    component="a"
                    href={href}
                    target="_blank"
                    sx={{ color: "white", display: "flex", alignItems: "center" }}
                  >
                    {icon}
                    <Typography variant="overline">{label}</Typography>
                  </Button>
                )}

                {submenu && openSubmenuLabel === label && (
                  <Menu
                    anchorEl={subMenuAnchor}
                    open={Boolean(subMenuAnchor)}
                    onClose={handleCloseSubmenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    disableScrollLock
                  >
                    {submenu.map((item) => (
                      <MenuItem
                        key={item.label}
                        component="a"
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Go to ${label}`}
                        onClick={handleCloseSubmenu}
                      >
                        <Typography variant="body2">{item.label}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;
